import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    Box, Flex, Heading, Text, Button, Image,
    VStack, HStack, Container, Avatar, SimpleGrid,
    useDisclosure, IconButton, Slide, Divider,
    AspectRatio, useInterval, Spinner, useColorMode, useColorModeValue
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import axios from 'axios';
import logo from "../../assets/srkrlogo.jpeg"
import { api } from "../../actions/api"
import { useUser } from '../../context/UserContext';

const HomePage = () => {
    const { isOpen, onToggle } = useDisclosure();
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeNavItem, setActiveNavItem] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registeredEvents, setRegisteredEvents] = useState([]);

    const { colorMode, toggleColorMode } = useColorMode();
    const { 
        user,
        eventsCache, setEventsCache, 
        registeredEventsCache, setRegisteredEventsCache 
    } = useUser();

    // Theme values
    const bg = useColorModeValue("white", "black");
    const color = useColorModeValue("black", "white");
    const navBg = useColorModeValue("white", "gray.900");
    const navColor = useColorModeValue("black", "white");
    const menuButtonColor = useColorModeValue("black", "white");
    const cardBg = useColorModeValue("gray.50", "black");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.205"); // subtle border for light, matches black for dark
    const footerBg = useColorModeValue("gray.100", "gray.900");
    const footerText = useColorModeValue("gray.600", "gray.500");

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // 1. Load regular events
                let currentEvents = eventsCache;
                if (!currentEvents) {
                    const eventsRes = await axios.get(`${api}/events`);
                    currentEvents = eventsRes.data;
                    if (isMounted) {
                        setEventsCache(currentEvents);
                    }
                }
                
                if (isMounted && currentEvents) {
                    // Filter duplicates to prevent double rendering
                    const uniqueEvents = Array.from(new Map(currentEvents.map(e => [e._id, e])).values());
                    setEvents(uniqueEvents);
                }

                // 2. Load registered events
                if (id) {
                    let currentReg = registeredEventsCache[id];
                    if (!currentReg) {
                        const regRes = await axios.get(`${api}/register/${id}`);
                        currentReg = regRes.data;
                        if (isMounted) {
                            setRegisteredEventsCache(prev => ({
                                ...prev,
                                [id]: regRes.data
                            }));
                        }
                    }
                    
                    if (isMounted && currentReg) {
                        // Filter duplicates by event._id to avoid repeating identical events
                        const uniqueReg = Array.from(new Map(currentReg.map(r => [r.event?._id || r._id, r])).values());
                        setRegisteredEvents(uniqueReg);
                    }
                }
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [id, eventsCache, registeredEventsCache, setEventsCache, setRegisteredEventsCache]);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('events')) setActiveNavItem('events');
        else if (path.includes('gallery')) setActiveNavItem('gallery');
        else if (path.includes('about')) setActiveNavItem('about');
        else setActiveNavItem('');
    }, [location]);

    useInterval(() => {
        if (events.length > 0) {
            setActiveSlide((prev) => (prev + 1) % events.length);
        }
    }, 5000);

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg={bg}>
                <Spinner size="xl" color="orange.400" />
            </Flex>
        );
    }

    return (
        <Box bg={bg} color={color} minH="100vh" overflowX="hidden">
            {/* Navigation Bar */}
            <Box bg={navBg} position="sticky" top={0} zIndex={20} boxShadow="md">
                <Container maxW="container.xl">
                    <Flex h={16} alignItems="center" justifyContent="space-between">
                        <HStack spacing={4}>
                            <Image
                                src={logo}
                                alt="SRKR Logo"
                                h="70px"
                            />
                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={navColor}
                                whiteSpace="nowrap"
                            >
                                SRKR CampusEvents
                            </Text>
                        </HStack>

                        <HStack spacing={4}>
                            {/* Theme Toggle Button - desktop only */}
                            <IconButton
                                display={{ base: "none", md: "inline-flex" }}
                                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                                onClick={toggleColorMode}
                                aria-label="Toggle Theme"
                                variant="ghost"
                                color={menuButtonColor}
                            />

                            {/* Desktop Nav */}
                            <HStack as="nav" spacing={8} display={{ base: "none", md: "flex" }}>
                                <Link to={`/events/${id}`}>
                                    <Button
                                        variant="ghost"
                                        color={navColor}
                                        position="relative"
                                        fontSize="xl"
                                        fontWeight="bold"
                                        _after={{
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            right: '0',
                                            height: '2px',
                                            bg: activeNavItem === 'events' ? 'orange.400' : 'transparent',
                                            transform: activeNavItem === 'events' ? 'scaleX(1)' : 'scaleX(0)',
                                            transition: 'transform 0.3s ease, background 0.3s ease'
                                        }}
                                        _hover={{
                                            _after: {
                                                bg: 'orange.400',
                                                transform: 'scaleX(1)'
                                            }
                                        }}
                                    >
                                        Events
                                    </Button>
                                </Link>

                                <Link to={`/gallery`}>
                                    <Button
                                        variant="ghost"
                                        color={navColor}
                                        position="relative"
                                        fontSize="xl"
                                        fontWeight="bold"
                                        _after={{
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            right: '0',
                                            height: '2px',
                                            bg: activeNavItem === 'gallery' ? 'orange.400' : 'transparent',
                                            transform: activeNavItem === 'gallery' ? 'scaleX(1)' : 'scaleX(0)',
                                            transition: 'transform 0.3s ease, background 0.3s ease'
                                        }}
                                        _hover={{
                                            _after: {
                                                bg: 'orange.400',
                                                transform: 'scaleX(1)'
                                            }
                                        }}
                                    >
                                        Gallery
                                    </Button>
                                </Link>

                                <Link to={`/about`}>
                                    <Button
                                        variant="ghost"
                                        color={navColor}
                                        position="relative"
                                        fontSize="xl"
                                        fontWeight="bold"
                                        _after={{
                                            content: '""',
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            right: '0',
                                            height: '2px',
                                            bg: activeNavItem === 'about' ? 'orange.400' : 'transparent',
                                            transform: activeNavItem === 'about' ? 'scaleX(1)' : 'scaleX(0)',
                                            transition: 'transform 0.3s ease, background 0.3s ease'
                                        }}
                                        _hover={{
                                            _after: {
                                                bg: 'orange.400',
                                                transform: 'scaleX(1)'
                                            }
                                        }}
                                    >
                                        About
                                    </Button>
                                </Link>

                                <Link to={`/profile/${id}`}>
                                    <Avatar
                                        size="md"
                                        name="Profile"
                                        src=" "
                                        _hover={{
                                            boxShadow: '0 0 10px rgba(255, 140, 0, 0.7)',
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                </Link>
                            </HStack>

                            {/* Mobile Nav Toggle */}
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                onClick={onToggle}
                                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                                variant="outline"
                                aria-label="Toggle Navigation"
                                color={menuButtonColor}
                            />
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Slide direction="right" in={isOpen} style={{ zIndex: 30 }}>
                <Box bg={navBg} p={4} color={color} shadow="lg" w="full">
                    <VStack align="stretch" spacing={4}>
                        <Link to={`/events/${id}`} onClick={onToggle}>
                            <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                fontSize="xl"
                                fontWeight="bold"
                                color={navColor}
                            >
                                Events
                            </Button>
                        </Link>

                        <Link to={`/gallery`} onClick={onToggle}>
                            <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                fontSize="xl"
                                fontWeight="bold"
                                color={navColor}
                            >
                                Gallery
                            </Button>
                        </Link>

                        <Link to={`/about`} onClick={onToggle}>
                            <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                fontSize="xl"
                                fontWeight="bold"
                                color={navColor}
                            >
                                About
                            </Button>
                        </Link>

                        <Link to={`/profile/${id}`} onClick={onToggle}>
                            <Button
                                variant="ghost"
                                w="full"
                                justifyContent="flex-start"
                                fontSize="xl"
                                fontWeight="bold"
                                color={navColor}
                                pl={2}
                            >
                                Profile
                            </Button>
                        </Link>

                        {/* Theme Toggle in sandwich menu */}
                        <Button
                            leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            onClick={() => {
                                toggleColorMode();
                                onToggle();
                            }}
                            variant="ghost"
                            w="full"
                            justifyContent="flex-start"
                            fontSize="xl"
                            fontWeight="bold"
                            color={navColor}
                        >
                            {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </Button>
                    </VStack>
                </Box>
            </Slide>

            {/* Hero Slider - Upcoming Events */}
            <Box w="full" h={{ base: "50vh", md: "70vh" }} position="relative" overflow="hidden">
                {events.map((event, index) => (
                    <Box
                        key={event._id}
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        opacity={index === activeSlide ? 1 : 0}
                        transition="opacity 1s ease-in-out"
                        zIndex={index === activeSlide ? 1 : 0}
                    >
                        <AspectRatio ratio={16 / 9} w="full" h="full">
                            <Box position="relative">
                                <Image
                                    src={`${event.photoBase64}`}
                                    alt={event.name}
                                    w="full"
                                    h="full"
                                    objectFit="cover"
                                    filter="brightness(0.7)"
                                />
                                <Box
                                    position="absolute"
                                    bottom={0}
                                    left={0}
                                    right={0}
                                    p={8}
                                    bgGradient="linear(to-t, blackAlpha.900, transparent)"
                                >
                                    <Container maxW="container.xl">
                                        <Heading as="h2" size="2xl" mb={4} color="white">
                                            {event.name}
                                        </Heading>
                                        <Text fontSize="xl" mb={6} color="whiteAlpha.900">
                                            {event.description}
                                        </Text>
                                        <Button
                                            onClick={(e) => {
                                                if (!user) {
                                                    e.preventDefault();
                                                    navigate('/signup');
                                                }
                                            }}
                                            as={Link}
                                            to={`/register/${id}/${event._id}`}
                                            colorScheme="orange"
                                            size="lg"
                                            _hover={{ transform: "scale(1.05)" }}
                                            transition="all 0.2s"
                                        >
                                            Register Now
                                        </Button>
                                    </Container>
                                </Box>
                            </Box>
                        </AspectRatio>
                    </Box>
                ))}

                {/* Slide indicators */}
                <HStack
                    position="absolute"
                    bottom={4}
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={2}
                    spacing={2}
                >
                    {events.map((event, index) => (
                        <Box
                            key={event._id}
                            w="12px"
                            h="12px"
                            borderRadius="full"
                            bg={index === activeSlide ? "orange.400" : "whiteAlpha.500"}
                            cursor="pointer"
                            onClick={() => setActiveSlide(index)}
                            _hover={{ bg: "orange.300" }}
                            transition="background 0.2s"
                        />
                    ))}
                </HStack>
            </Box>

            {/* Content */}
            <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={8}>
                {/* Club Story Section */}
                <Box mb={16}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="center">
                        <Box>
                            <Heading as="h2" size="xl" mb={6} color="orange.400">
                                About SRKR CampusEvents
                            </Heading>
                            <Text mb={4} fontSize="lg">
                                Started in 2015, SRKR CampusEvents has become the central hub for managing and celebrating all campus activities and technical events at SRKR Engineering College.
                            </Text>
                            <Text mb={4} fontSize="lg">
                                Our goal is to bring together students, organizers, and departments through a unified platform that simplifies event discovery, registration, and participation.
                            </Text>
                            <Text fontSize="lg">
                                Over the years, we've successfully managed 100+ campus events, from workshops and hackathons to cultural fests and seminars — helping students stay engaged and connected.
                            </Text>
                        </Box>

                        <Image
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Coding Club Team"
                            borderRadius="lg"
                            objectFit="cover"
                            h="400px"
                            w="full"
                        />
                    </SimpleGrid>
                </Box>

                {/* Registered Events Section */}
                {id && registeredEvents.length > 0 && (
                    <Box mb={16}>
                        <Heading as="h2" size="xl" mb={8} color="teal.400">
                            Your Registered Programs
                        </Heading>

                        <Flex
                            overflowX="auto"
                            gap={8}
                            pb={4}
                            scrollSnapType="x mandatory"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    height: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'orange.400',
                                    borderRadius: '10px',
                                },
                            }}
                        >
                            {registeredEvents.map((event) => (
                                <Box
                                    key={event._id}
                                    minW={{ base: "280px", md: "350px" }}
                                    maxW={{ base: "280px", md: "350px" }}
                                    flex="0 0 auto"
                                    scrollSnapAlign="start"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    borderColor={cardBorder}
                                    bg={cardBg}
                                    overflow="hidden"
                                    _hover={{
                                        borderColor: "orange.400",
                                        transform: "translateY(-5px)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <Image
                                        src={`${event.event.photoBase64}`}
                                        alt={event.event.name}
                                        h="200px"
                                        w="full"
                                        objectFit="cover"
                                    />
                                    <Box p={6}>
                                        <Heading as="h3" size="lg" mb={2} color="orange.400" isTruncated>
                                            {event.event.name}
                                        </Heading>
                                        <Text color="gray.400" mb={2}>{new Date(event.event.date).toLocaleDateString()}</Text>
                                        <Text mb={4} noOfLines={3}>{event.event.description}</Text>
                                        <Text fontWeight="bold" fontSize="sm" color="orange.300">Registration ID: {event._id}</Text>
                                    </Box>
                                </Box>
                            ))}
                        </Flex>
                    </Box>
                )}

                {/* All Events Section */}
                <Box mb={16}>
                    <Heading as="h2" size="xl" mb={8} color="teal.400">
                        Upcoming Events
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                        {events.slice(0, 2).map((event) => (
                            <Box
                                key={event._id}
                                borderWidth="1px"
                                borderRadius="lg"
                                borderColor={cardBorder}
                                bg={cardBg}
                                overflow="hidden"
                                _hover={{
                                    borderColor: "orange.400",
                                    transform: "translateY(-5px)",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <Image
                                    src={`${event.photoBase64}`}
                                    alt={event.name}
                                    h="250px"
                                    w="full"
                                    objectFit="cover"
                                />
                                <Box p={6}>
                                    <Heading as="h3" size="lg" mb={2} color="orange.400">
                                        {event.name}
                                    </Heading>
                                    <Text color="gray.400" mb={2}>{new Date(event.date).toLocaleDateString()}</Text>
                                    <Text mb={4}>{event.description}</Text>
                                    <Button
                                        onClick={(e) => {
                                            if (!user) {
                                                e.preventDefault();
                                                navigate('/signup');
                                            }
                                        }}
                                        as={Link}
                                        to={`/register/${id}/${event._id}`}
                                        colorScheme="orange"
                                        size="sm"
                                        _hover={{ transform: "scale(1.05)" }}
                                        transition="all 0.2s"
                                    >
                                        Register Now
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>

                    <Flex justify="center" mt={8}>
                        <Button
                            as={Link}
                            to={`/events/${id}`}
                            colorScheme="orange"
                            size="lg"
                            _hover={{ transform: "scale(1.05)" }}
                            transition="all 0.2s"
                        >
                            View All Events
                        </Button>
                    </Flex>
                </Box>
            </Container>

            {/* Footer */}
            <Box bg={footerBg} color={footerText} py={8}>
                <Container maxW="container.xl">
                    <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
                        <Image
                            src={logo}
                            alt="SRKR Coding Club Logo"
                            h="100px"
                            mb={{ base: 4, md: 0 }}
                        />
                        <HStack spacing={6}>
                            <Link to={`/about`}>About</Link>
                            <Link to={`/events/${id}`}>Events</Link>
                            <Link to={`/gallery`}>Gallery</Link>
                            <Link to={`/about`}>Contact</Link>
                        </HStack>
                    </Flex>
                    <Divider my={4} borderColor="whiteAlpha.200" />
                    <Text textAlign="center" color="gray.500">
                        © {new Date().getFullYear()} SRKR CampusEvents. All rights reserved.
                    </Text>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;
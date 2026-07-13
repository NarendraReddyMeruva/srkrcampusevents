import React, { useEffect, useState } from 'react';
import {
    Box, Button, Flex, Heading, VStack, Text, Avatar,
    Popover, PopoverTrigger, PopoverContent, PopoverBody,
    PopoverArrow, useDisclosure, Divider, Image, Stack,
    useToast, Spinner, Container, HStack, Badge, Icon, IconButton,
    useColorMode, useColorModeValue
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { FiCalendar, FiPhone, FiMail } from 'react-icons/fi';
import { useUser } from '../../context/UserContext';
import eventimg from "../../assets/Events.jpg";
import Galimg from "../../assets/Gallery.webp";
import about from "../../assets/about-us.png";
import { api } from "../../actions/api";
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, adminProfileCache, setAdminProfileCache } = useUser();
    const { isOpen, onToggle, onClose } = useDisclosure();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    const { colorMode, toggleColorMode } = useColorMode();

    // Theme values
    const bg = useColorModeValue("white", "black");
    const color = useColorModeValue("black", "white");
    const panelBg = useColorModeValue("gray.50", "black");
    const panelBorder = useColorModeValue("gray.200", "orange.500");
    const dividerColor = useColorModeValue("gray.300", "orange.550");
    const navBg = useColorModeValue("orange.500", "orange.600");
    const navText = useColorModeValue("black", "white");
    const cardBg = useColorModeValue("gray.100", "black");

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`${api}/adminprofile/${id}`, {
                    validateStatus: (status) => status < 500
                });

                if (response.data.success) {
                    const data = response.data.data;
                    setAdminData(data);
                    setAdminProfileCache(prev => ({ ...prev, [id]: data }));
                    localStorage.setItem(`adminData-${id}`, JSON.stringify(data));
                } else {
                    throw new Error(response.data.message || 'Failed to load admin profile');
                }
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError(err.message || 'Failed to load admin profile');
                
                if (!err.response?.data) {
                    toast({
                        title: 'Network Error',
                        description: 'Unable to connect to the server',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        // Check context cache first
        if (adminProfileCache && adminProfileCache[id]) {
            setAdminData(adminProfileCache[id]);
            setLoading(false);
        } else {
            // Check localStorage
            const cachedAdminData = localStorage.getItem(`adminData-${id}`);
            if (cachedAdminData) {
                const data = JSON.parse(cachedAdminData);
                setAdminData(data);
                setAdminProfileCache(prev => ({ ...prev, [id]: data }));
                setLoading(false);
            } else {
                if (id) {
                    fetchAdminData();
                } else {
                    setLoading(false);
                    setError('No admin ID provided');
                }
            }
        }
    }, [id, toast, adminProfileCache, setAdminProfileCache]);

    const handleSignOut = () => {
        navigate('/');
    };

    const handleEditProfile = () => {
        navigate(`/adminprofile/edit/${id}`);
    };

    const displayUser = adminData || user;

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg={bg} direction="column" gap={4}>
                <Spinner 
                    size="xl" 
                    color="orange.400" 
                    thickness="4px"
                    emptyColor="gray.700"
                    speed="0.65s"
                />
                <Text color="orange.400" fontSize="lg" fontWeight="semibold">
                    Loading admin profile...
                </Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex direction="column" justify="center" align="center" minH="100vh" bg={bg} p={4} gap={6}>
                <Box textAlign="center">
                    <Text color="orange.400" fontSize="2xl" fontWeight="bold" mb={2}>
                        Error loading admin profile
                    </Text>
                    <Text color="orange.200" fontSize="md">
                        {error}
                    </Text>
                </Box>
                <Flex gap={4}>
                    <Button 
                        colorScheme="orange" 
                        onClick={() => window.location.reload()}
                        size="lg"
                        px={8}
                    >
                        Retry
                    </Button>
                    <Button 
                        variant="outline" 
                        colorScheme="orange"
                        onClick={() => navigate('/')}
                        size="lg"
                        px={8}
                    >
                        Go to Home
                    </Button>
                </Flex>
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg={bg} color={color} display="flex" flexDirection="column">
            {/* Header */}
            <Flex
                bg={navBg}
                color={navText}
                p={4}
                align="center"
                justify="space-between"
                boxShadow="lg"
                position="sticky"
                top={0}
                zIndex={10}
            >
                <Heading size="lg" textAlign="center" flex="1" letterSpacing="wide" color={navText}>
                    Admin Dashboard
                </Heading>

                <HStack spacing={4}>
                    <IconButton
                        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        onClick={toggleColorMode}
                        aria-label="Toggle Theme"
                        variant="ghost"
                        color={navText}
                    />

                    <Popover isOpen={isOpen} onClose={onClose}>
                        <PopoverTrigger>
                            <Avatar
                                size="md"
                                name={displayUser?.name || 'Admin'}
                                cursor="pointer"
                                onClick={onToggle}
                                bg="black"
                                color="orange.500"
                                _hover={{
                                    boxShadow: '0 0 15px rgba(255, 140, 0, 0.9)',
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </PopoverTrigger>
                        <PopoverContent bg="black" borderColor="orange.500" color="orange.400" borderWidth="2px">
                            <PopoverArrow bg="black" borderColor="orange.500" />
                            <PopoverBody p={4}>
                                <VStack align="flex-start" spacing={3}>
                                    <HStack>
                                        <Icon as={FiMail} color="orange.400" />
                                        <Text>{displayUser?.email || "admin@example.com"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FiPhone} color="orange.400" />
                                        <Text>{displayUser?.phone || "Not provided"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FiCalendar} color="orange.400" />
                                        <Text>
                                            {displayUser?.dob ? new Date(displayUser.dob).toLocaleDateString() : "Not provided"}
                                        </Text>
                                    </HStack>
                                    <Divider borderColor="orange.500" />
                                    <Button
                                        leftIcon={<FaEdit />}
                                        colorScheme="orange"
                                        variant="outline"
                                        w="100%"
                                        onClick={handleEditProfile}
                                        size="md"
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        leftIcon={<FaSignOutAlt />}
                                        colorScheme="orange"
                                        variant="outline"
                                        w="100%"
                                        onClick={handleSignOut}
                                        size="md"
                                        _hover={{
                                            bg: 'orange.500',
                                            color: 'black'
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                </VStack>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </HStack>
            </Flex>

            {/* Main Content */}
            <Container maxW="container.xl" py={8} flex="1">
                {/* Dashboard Buttons */}
                <Flex justifyContent="center" alignItems="center" mb={10}>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        spacing={{ base: 12, md: 8 }}
                        rowGap={12}
                        columnGap={40}
                        w="100%"
                        maxW="4xl"
                        align="center"
                        justify="center"
                    >
                        {/* Events Button */}
                        <Box
                            position="relative"
                            w={{ base: '100%', md: '300px' }}
                            h="200px"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="xl"
                            _hover={{
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(255, 140, 0, 0.4)',
                            }}
                            transition="all 0.3s ease"
                            cursor="pointer"
                            onClick={() => navigate('/adminevents')}
                        >
                            <Image
                                src={eventimg}
                                alt="Events"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                filter="brightness(0.7)"
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                p={4}
                                bg="rgba(0, 0, 0, 0.5)"
                                _hover={{
                                    bg: 'rgba(255, 165, 0, 0.8)',
                                    '& > *': {
                                        color: 'black',
                                    }
                                }}
                                transition="all 0.3s ease"
                            >
                                <Text
                                    fontSize="2xl"
                                    fontWeight="extrabold"
                                    color="orange.400"
                                    textAlign="center"
                                    textTransform="uppercase"
                                    letterSpacing="wide"
                                >
                                    Events
                                </Text>
                                <Text
                                    fontSize="md"
                                    color="orange.200"
                                    textAlign="center"
                                >
                                    Manage all events
                                </Text>
                            </Box>
                        </Box>

                        {/* Gallery Button */}
                        <Box
                            position="relative"
                            w={{ base: '100%', md: '300px' }}
                            h="200px"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="xl"
                            _hover={{
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(255, 140, 0, 0.4)',
                            }}
                            transition="all 0.3s ease"
                            cursor="pointer"
                            onClick={() => navigate('/admingallery')}
                        >
                            <Image
                                src={Galimg}
                                alt="Gallery"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                filter="brightness(0.7)"
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                p={4}
                                bg="rgba(0, 0, 0, 0.5)"
                                _hover={{
                                    bg: 'rgba(255, 165, 0, 0.8)',
                                    '& > *': {
                                        color: 'black',
                                    }
                                }}
                                transition="all 0.3s ease"
                            >
                                <Text
                                    fontSize="2xl"
                                    fontWeight="extrabold"
                                    color="orange.400"
                                    textAlign="center"
                                    textTransform="uppercase"
                                    letterSpacing="wide"
                                >
                                    Gallery
                                </Text>
                                <Text
                                    fontSize="md"
                                    color="orange.200"
                                    textAlign="center"
                                >
                                    Manage your gallery
                                </Text>
                            </Box>
                        </Box>

                        {/* verification Button */}
                        <Box
                            position="relative"
                            w={{ base: '100%', md: '300px' }}
                            h="200px"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="xl"
                            _hover={{
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(255, 140, 0, 0.4)',
                            }}
                            transition="all 0.3s ease"
                            cursor="pointer"
                            onClick={() => navigate('/ticket/verification')}
                        >
                            <Image
                                src={about}
                                alt="About"
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                filter="brightness(0.7)"
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                p={4}
                                bg="rgba(0, 0, 0, 0.5)"
                                _hover={{
                                    bg: 'rgba(255, 165, 0, 0.8)',
                                    '& > *': {
                                        color: 'black',
                                    }
                                }}
                                transition="all 0.3s ease"
                            >
                                <Text
                                    fontSize="2xl"
                                    fontWeight="extrabold"
                                    color="orange.400"
                                    textAlign="center"
                                    textTransform="uppercase"
                                    letterSpacing="wide"
                                >
                                    Ticket Verification
                                </Text>
                                <Text
                                    fontSize="md"
                                    color="orange.200"
                                    textAlign="center"
                                >
                                    know your validity
                                </Text>
                            </Box>
                        </Box>
                    </Stack>
                </Flex>

                {/* Admin Profile Section */}
                <Box bg={panelBg} borderColor={panelBorder} borderWidth="1px" borderRadius="lg" p={6} boxShadow="xl" mb={8}>
                    <Heading size="lg" mb={6} color="orange.400">
                        Admin Profile
                    </Heading>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                        <VStack spacing={4} align="center" w={{ base: '100%', md: '30%' }}>
                            <Avatar
                                size="2xl"
                                name={displayUser?.name || 'Admin'}
                                bg="orange.400"
                                color="black"
                                fontWeight="bold"
                            />
                            <Heading size="lg" color="orange.400" textAlign="center">
                                {displayUser?.name || 'Admin'}
                            </Heading>
                            <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                                Administrator
                            </Badge>
                        </VStack>

                        <VStack spacing={4} align="start" flex={1}>
                            <Box>
                                <Heading size="md" mb={2} color="orange.400">
                                    Contact Information
                                </Heading>
                                <VStack spacing={3} align="start">
                                    <HStack>
                                        <Icon as={FiMail} color="orange.400" />
                                        <Text>{displayUser?.email || "admin@example.com"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FiPhone} color="orange.400" />
                                        <Text>{displayUser?.phone || "Not provided"}</Text>
                                    </HStack>
                                    <HStack>
                                        <Icon as={FiCalendar} color="orange.400" />
                                        <Text>
                                            {displayUser?.dob ? new Date(displayUser.dob).toLocaleDateString() : "Not provided"}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Box>

                            <Box w="full">
                                <Heading size="md" mb={2} color="orange.400">
                                    Admin Activities
                                </Heading>
                                <Box
                                    p={4}
                                    bg={cardBg}
                                    borderRadius="md"
                                    borderLeft="4px solid"
                                    borderColor="orange.400"
                                >
                                    <Text>Recent admin activities will appear here.</Text>
                                </Box>
                            </Box>
                        </VStack>
                    </Flex>
                </Box>
            </Container>

            {/* Footer */}
            <Box
                bg={panelBg}
                color="orange.400"
                p={4}
                textAlign="center"
                borderTop="1px"
                borderColor="orange.500"
                mt="auto"
            >
                <Text fontSize="lg" letterSpacing="wide">
                    © {new Date().getFullYear()} Event Management System. All rights reserved.
                </Text>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
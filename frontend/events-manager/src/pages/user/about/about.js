import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Container,
  SimpleGrid,
  useDisclosure,
  IconButton,
  Slide,
  Divider,
  Avatar,
  Spinner,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import logo from "../../../assets/srkrlogo.jpeg"

const AboutPage = () => {
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNavItem, setActiveNavItem] = useState("");
  const [loading, setLoading] = useState(false);

  const { colorMode, toggleColorMode } = useColorMode();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const navBg = useColorModeValue("white", "gray.900");
  const navColor = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("gray.50", "black");
  const cardBorder = useColorModeValue("gray.200", "transparent");
  const footerBg = useColorModeValue("gray.100", "gray.900");
  const subTextColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("events")) setActiveNavItem("events");
    else if (path.includes("gallery")) setActiveNavItem("gallery");
    else if (path.includes("about")) setActiveNavItem("about");
    else setActiveNavItem("");
  }, [location]);

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
                alt="SRKR CampusEvents Logo"
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
                color={navColor}
              />

              {/* Back Button */}
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                colorScheme="orange"
                size="sm"
              >
                Back
              </Button>

              {/* Desktop Nav */}
              <HStack as="nav" spacing={8} display={{ base: "none", md: "flex" }}>
                <Link to="/events">
                  <Button
                    variant="ghost"
                    color={navColor}
                    position="relative"
                    fontSize="xl"
                    fontWeight="bold"
                    _after={{
                      content: '""',
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      height: "2px",
                      bg:
                        activeNavItem === "events" ? "orange.400" : "transparent",
                      transform:
                        activeNavItem === "events" ? "scaleX(1)" : "scaleX(0)",
                      transition: "transform 0.3s ease, background 0.3s ease",
                    }}
                    _hover={{
                      _after: {
                        bg: "orange.400",
                        transform: "scaleX(1)",
                      },
                    }}
                  >
                    Events
                  </Button>
                </Link>

                <Link to="/gallery">
                  <Button
                    variant="ghost"
                    color={navColor}
                    position="relative"
                    fontSize="xl"
                    fontWeight="bold"
                    _after={{
                      content: '""',
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      height: "2px",
                      bg:
                        activeNavItem === "gallery" ? "orange.400" : "transparent",
                      transform:
                        activeNavItem === "gallery" ? "scaleX(1)" : "scaleX(0)",
                      transition: "transform 0.3s ease, background 0.3s ease",
                    }}
                    _hover={{
                      _after: {
                        bg: "orange.400",
                        transform: "scaleX(1)",
                      },
                    }}
                  >
                    Gallery
                  </Button>
                </Link>

                <Link to="/about">
                  <Button
                    variant="ghost"
                    color={navColor}
                    position="relative"
                    fontSize="xl"
                    fontWeight="bold"
                    _after={{
                      content: '""',
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      height: "2px",
                      bg:
                        activeNavItem === "about" ? "orange.400" : "transparent",
                      transform:
                        activeNavItem === "about" ? "scaleX(1)" : "scaleX(0)",
                      transition: "transform 0.3s ease, background 0.3s ease",
                    }}
                    _hover={{
                      _after: {
                        bg: "orange.400",
                        transform: "scaleX(1)",
                      },
                    }}
                  >
                    About
                  </Button>
                </Link>
              </HStack>

              {/* Mobile Nav Toggle */}
              <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onToggle}
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                variant="outline"
                aria-label="Toggle Navigation"
                color={navColor}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Nav */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 30 }}>
        <Box bg={navBg} p={4} color={color} shadow="lg" w="full">
          <VStack align="stretch" spacing={4}>
            <Link to="/events" onClick={onToggle}>
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
            <Link to="/gallery" onClick={onToggle}>
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
            <Link to="/about" onClick={onToggle}>
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

      {/* About Page Content */}
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={12}>
        <Box textAlign="center" mb={16}>
          <Heading as="h1" size="2xl" color="orange.400" mb={4}>
            About SRKR CampusEvents
          </Heading>
          <Text fontSize="xl" color={subTextColor} maxW="3xl" mx="auto">
            SRKR CampusEvents is the official platform for managing and celebrating
            all campus activities and technical events at SRKR Engineering College.
            We connect students, organizers, and departments through a unified space
            that makes event discovery, registration, and participation effortless.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} mb={20} alignItems="center">
          <Box>
            <Heading as="h2" size="xl" mb={4} color="teal.400">
              Our Mission
            </Heading>
            <Text fontSize="lg" mb={4}>
              To bring every campus event under one digital roof, simplifying
              coordination and boosting student engagement.
            </Text>
            <Text fontSize="lg" mb={4}>
              We aim to make every event—be it a workshop, hackathon, or fest—
              easily accessible and organized through technology.
            </Text>
            <Text fontSize="lg">
              Together, we make campus life more vibrant, connected, and memorable.
            </Text>
          </Box>
          <Image
            src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=900&q=80"
            alt="Campus Event"
            borderRadius="lg"
            objectFit="cover"
            h="400px"
            w="full"
          />
        </SimpleGrid>

        <Box textAlign="center" mb={16}>
          <Heading as="h2" size="xl" mb={6} color="orange.400">
            Our Team
          </Heading>
          <Text fontSize="lg" mb={10} color={subTextColor}>
            The dedicated team behind SRKR CampusEvents ensures every event,
            seminar, and celebration is executed seamlessly.
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
            {[
              { name: "Narendra Reddy", role: "Member" },
              { name: "Marri Nandini", role: "Member" },
              { name: "LINGAMPALLI RAKESH", role: "Member" },
              { name: "MANDAPATI SRI VENKATA SIVA KRISHNA", role: "Member" },
            ].map((member, i) => (
              <Box
                key={i}
                p={6}
                borderWidth="1px"
                borderColor={cardBorder}
                borderRadius="lg"
                bg={cardBg}
                textAlign="center"
                _hover={{
                  borderColor: "orange.400",
                  transform: "translateY(-5px)",
                  transition: "all 0.3s ease",
                }}
              >
                <Avatar
                  size="xl"
                  name={member.name}
                  mb={4}
                />
                <Heading as="h3" size="md" color="orange.300">
                  {member.name}
                </Heading>
                <Text color="gray.400">{member.role}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Flex justify="center" mt={10}>
          <Button
            as={Link}
            to="/events"
            colorScheme="orange"
            size="lg"
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.2s"
          >
            Explore Upcoming Events
          </Button>
        </Flex>
      </Container>

      {/* Footer */}
      <Box bg={footerBg} py={8}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
          >
            <Image
              src={logo}
              alt="SRKR CampusEvents Logo"
              h="100px"
              mb={{ base: 4, md: 0 }}
            />
            <HStack spacing={6}>
              <Link to="/about">About</Link>
              <Link to="/events">Events</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/about">Contact</Link>
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

export default AboutPage;

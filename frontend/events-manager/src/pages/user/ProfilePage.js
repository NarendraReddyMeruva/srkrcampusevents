import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Flex, Heading, Text, Avatar, VStack,
  HStack, Container, Divider, Spinner,
  Badge, Button, useToast, Icon, useColorMode, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FiEdit, FiCalendar, FiPhone, FiMail, FiLogOut } from 'react-icons/fi';
import {api} from "../../actions/api"
import { useUser } from '../../context/UserContext';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  const { colorMode, toggleColorMode } = useColorMode();
  const { profileCache, setProfileCache } = useUser();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("gray.50", "black");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const dividerColor = useColorModeValue("gray.300", "gray.700");
  const activityBg = useColorModeValue("gray.100", "black");

  const handleSignOut = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      // Check cache first
      if (profileCache[id]) {
        setProfile(profileCache[id]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${api}/profile/${id}`);
        setProfile(response.data);
        setProfileCache(prev => ({ ...prev, [id]: response.data }));
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load profile';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast, profileCache, setProfileCache]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bg}>
        <Spinner size="xl" color="orange.400" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bg}>
        <Text color={color}>{error}</Text>
      </Flex>
    );
  }

  if (!profile) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bg}>
        <Text color={color}>Profile not found</Text>
      </Flex>
    );
  }

  return (
    <Box bg={bg} color={color} minH="100vh" py={10}>
      <Container maxW="container.lg">
        {/* Top Controls: Back and Theme Toggle */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button 
            onClick={() => navigate(-1)} 
            leftIcon={<ArrowBackIcon />} 
            variant="outline" 
            colorScheme="orange"
          >
            Back
          </Button>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            aria-label="Toggle Theme"
            variant="ghost"
            color={color}
            size="lg"
          />
        </Flex>

        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Left Side - Profile Card */}
          <Box
            w={{ base: '100%', md: '30%' }}
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            boxShadow="xl"
          >
            <VStack spacing={4} align="center">
              <Avatar
                size="2xl"
                name={profile.name}
                bg="orange.400"
                color="black"
                fontWeight="bold"
              />
              <Heading size="lg" color="orange.400" textAlign="center">
                {profile.name}
              </Heading>
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                Member
              </Badge>

              <Divider borderColor={dividerColor} />

              <VStack spacing={3} align="start" w="full">
                <HStack w="full" overflow="hidden">
                  <Icon as={FiMail} color="orange.400" flexShrink={0} />
                  <Text textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">{profile.email}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiPhone} color="orange.400" />
                  <Text>{profile.phone || 'Not provided'}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCalendar} color="orange.400" />
                  <Text>
                    {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                  </Text>
                </HStack>
              </VStack>

              <Button
                leftIcon={<FiEdit />}
                colorScheme="orange"
                variant="outline"
                w="full"
                mt={2}
              >
                Edit Profile
              </Button>

              <Button
                leftIcon={<FiLogOut />}
                colorScheme="red"
                variant="solid"
                w="full"
                mt={2}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </VStack>
          </Box>

          {/* Right Side - Content */}
          <Box
            flex={1}
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            boxShadow="xl"
          >
            <Heading size="lg" mb={6} color="orange.400">
              Your Activities
            </Heading>

            <Box mb={8}>
              <Heading size="md" mb={4}>
                Registered Events
              </Heading>
              <Box
                p={4}
                bg={activityBg}
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="orange.400"
              >
                <Text>You haven't registered for any events yet.</Text>
                <Button colorScheme="orange" size="sm" mt={2} onClick={() => navigate(`/events/${id}`)}>
                  Browse Events
                </Button>
              </Box>
            </Box>

            <Box>
              <Heading size="md" mb={4}>
                Achievements
              </Heading>
              <Box
                p={4}
                bg={activityBg}
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="orange.400"
              >
                <Text>No achievements yet.</Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default ProfilePage;

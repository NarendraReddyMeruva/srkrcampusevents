import React, { useEffect, useState } from 'react';
import {
  Box, Button, Image, Text, SimpleGrid,
  useToast, Heading, Flex, Badge, Spinner, useColorMode, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {api} from "../../../actions/api"
import { useUser } from '../../../context/UserContext';

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { userId } = useParams(); // ✅ Extract userId from URL params

  const { colorMode, toggleColorMode } = useColorMode();
  const { user, eventsCache, setEventsCache } = useUser();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("gray.50", "black");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  const fetchEvents = async () => {
    // Check cache first
    if (eventsCache) {
      setEvents(eventsCache);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get(api + '/events'); // ✅ Using axios directly
      setEvents(res.data);
      setEventsCache(res.data);
    } catch (error) {
      toast({
        title: 'Error fetching events',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegister = (eventId) => {
    if (!user) {
      toast({
        title: "Registration Required",
        description: "Please sign up or sign in to register for events.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      navigate("/signup");
      return;
    }

    if (!userId) {
      toast({
        title: "User ID not found",
        description: "Cannot register without user ID in URL",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    navigate(`/register/${userId}/${eventId}`); // ✅ Navigate with both userId and eventId
  };

  return (
    <Box bg={bg} minH="100vh" color={color} p={4}>
      {/* Header controls */}
      <Flex justify="space-between" align="center" mb={8} borderBottom="2px" borderColor="orange.500" pb={4}>
        <Button 
          onClick={() => userId ? navigate(`/home/${userId}`) : navigate(-1)} 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          colorScheme="orange"
        >
          Back
        </Button>
        <Heading size="lg" color="orange.400" textAlign="center">
          Upcoming Events
        </Heading>
        <IconButton
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          aria-label="Toggle Theme"
          variant="ghost"
          color={color}
          size="lg"
        />
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" color="orange.400" />
        </Flex>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={8} px={4}>
          {events.map(event => (
            <Box
              key={event._id}
              bg={cardBg}
              borderColor={cardBorder}
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'orange.400' }}
            >
              {event.photoBase64 && (
                <Image
                  src={event.photoBase64}
                  alt={event.name}
                  h="250px"
                  w="100%"
                  objectFit="cover"
                  borderTopRadius="xl"
                />
              )}
              <Box p={5}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading fontSize="xl">{event.name}</Heading>
                  <Badge colorScheme="orange" px={2} py={1}>
                    {new Date(event.date).toLocaleDateString()}
                  </Badge>
                </Flex>
                <Text noOfLines={3} mb={4}>{event.description}</Text>
                <Button
                  colorScheme="orange"
                  w="full"
                  onClick={() => handleRegister(event._id)}
                  _hover={{ bg: 'orange.600' }}
                >
                  Register Now
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default UserEventsPage;

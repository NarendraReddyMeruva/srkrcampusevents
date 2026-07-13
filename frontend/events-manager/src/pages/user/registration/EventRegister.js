import React, { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, useToast, Spinner, Text,
  Flex, useColorMode, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { api } from '../../../actions/api';
import { useUser } from '../../../context/UserContext';

const EventRegister = () => {
  const navigate = useNavigate();
  const { userId, eventId } = useParams(); // both userId and eventId from URL
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', attendees: 1 });
  const [ticket, setTicket] = useState(null);

  const { colorMode, toggleColorMode } = useColorMode();
  const { user, eventDetailsCache, setEventDetailsCache, clearCache } = useUser();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || user.Name || '',
        email: user.email || user.Email || '',
        phone: prev.phone || user.phone || user.Mobilenumber || ''
      }));
    }
  }, [user]);

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const formBg = useColorModeValue("gray.50", "gray.900");
  const formBorder = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("white", "gray.850");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    const fetchEvent = async () => {
      // Check cache first
      if (eventDetailsCache[eventId]) {
        setEvent(eventDetailsCache[eventId]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${api}/register/${eventId}`);
        setEvent(res.data);
        setEventDetailsCache(prev => ({
          ...prev,
          [eventId]: res.data
        }));
      } catch (err) {
        toast({
          title: 'Failed to load event',
          description: err.response?.data?.error || err.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, toast, eventDetailsCache, setEventDetailsCache]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendees' ? (value === "" ? "" : (isNaN(parseInt(value)) ? 1 : parseInt(value))) : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post(`${api}/register/${userId}/${eventId}`, formData);
      setTicket(res.data);

      // Invalidate registered events cache since user has a new ticket
      clearCache('registeredEvents');

      toast({
        title: 'Ticket Generated',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Ticket generation failed',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bg}>
        <Spinner size="xl" color="orange.400" />
      </Flex>
    );
  }

  if (!event) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bg}>
        <Box textAlign="center">
          <Heading size="md" color={color}>Event not found.</Heading>
          <Button onClick={() => navigate(-1)} mt={4} colorScheme="orange">Back</Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={10} px={4} position="relative" color={color}>
      {/* Top Header controls */}
      <Flex maxW="lg" mx="auto" justify="space-between" align="center" mb={6}>
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

      <Box 
        maxW="lg" 
        mx="auto" 
        p={6} 
        bg={formBg} 
        borderColor={formBorder}
        borderWidth="1px"
        borderRadius="lg" 
        boxShadow="2xl"
      >
        <Heading mb={6} size="xl" textAlign="center" color="orange.400">{event.name}</Heading>

        {ticket ? (
          <Box textAlign="center" py={4}>
            <Text mb={6} fontSize="lg" fontWeight="semibold" color="green.450">Ticket Generated Successfully!</Text>
            <Flex justify="center" p={4} bg="white" borderRadius="lg" w="fit-content" mx="auto" mb={6}>
              <QRCodeCanvas
                value={ticket.ticketId}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </Flex>
            <Text mt={4} fontSize="lg"><strong>Ticket ID:</strong> {ticket.ticketId}</Text>
            <Button
              mt={8}
              colorScheme="orange"
              w="full"
              size="lg"
              onClick={() => navigate(`/events/${userId}`)}
            >
              Back to Events
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Name</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={color}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Email</FormLabel>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  isReadOnly={!!(user?.email || user?.Email)}
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={color}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Phone</FormLabel>
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={color}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">No. of Attendees</FormLabel>
                <Input 
                  name="attendees" 
                  type="number" 
                  min={1} 
                  value={formData.attendees} 
                  onChange={handleChange} 
                  bg={inputBg}
                  borderColor={inputBorder}
                  color={color}
                />
              </FormControl>

              <Button type="submit" colorScheme="orange" width="full" size="lg" mt={4}>
                Generate Ticket
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default EventRegister;

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Input, Button, VStack, Text,
  useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Badge, Table, Thead, Tbody, Tr, Th, Td,
  Tag, TagLabel, Spinner, useColorMode, useColorModeValue, IconButton, HStack
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FaCheck, FaSearch, FaTicketAlt, FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../../actions/api';
import { useUser } from '../../context/UserContext';
import { Html5Qrcode } from 'html5-qrcode';

const TicketVerification = () => {
  const [ticketId, setTicketId] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useUser();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const panelBg = useColorModeValue("gray.50", "black");
  const panelBorder = useColorModeValue("gray.200", "gray.750");
  const inputBg = useColorModeValue("white", "gray.800");
  const inputBorder = useColorModeValue("gray.300", "gray.700");
  const modalBg = useColorModeValue("white", "gray.900");
  const resultBg = useColorModeValue("gray.100", "black");

  const handleVerifyTicket = async (idToVerify) => {
    const tid = typeof idToVerify === 'string' ? idToVerify : ticketId;

    if (!tid) {
      toast({
        title: 'Error',
        description: 'Please enter a ticket ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post(`${api}/tickets/verify`, { ticketId: tid });
      setTicketData(response.data);
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Verification failed';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGetTicketDetails = async (idToFetch) => {
    const tid = typeof idToFetch === 'string' ? idToFetch : ticketId;

    if (!tid) return;

    setLoading(true);
    try {
      const response = await axios.get(`${api}/tickets/${tid}`);
      setTicketData(response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch ticket details';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // QR scanner useEffect initialization
  useEffect(() => {
    let html5QrCode = null;
    let timer = null;

    if (isScanning) {
      // Delay slightly to let the modal mount and #qr-reader div render
      timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              setTicketId(decodedText);
              setIsScanning(false);
              
              toast({
                title: 'QR Code Scanned',
                description: `Ticket ID: ${decodedText}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
              });

              // Automatically call verify function
              handleVerifyTicket(decodedText);
            },
            (errorMessage) => {
              // Noise from frame parsing, can ignore
            }
          ).catch(err => {
            console.error("Scanner start error:", err);
            toast({
              title: 'Camera Error',
              description: 'Failed to access camera stream.',
              status: 'error',
              duration: 4000,
              isClosable: true,
            });
            setIsScanning(false);
          });
        } catch (err) {
          console.error("Scanner initialization error:", err);
        }
      }, 300);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error("Scanner stop error on cleanup:", err));
        }
      }
    };
  }, [isScanning]);

  const getStatusBadge = (isVerified) => {
    return isVerified ? (
      <Badge colorScheme="red" px={2} py={1} borderRadius="full">
        Used
      </Badge>
    ) : (
      <Badge colorScheme="green" px={2} py={1} borderRadius="full">
        Valid
      </Badge>
    );
  };

  const handleBack = () => {
    if (user) {
      navigate(`/admin/${user._id}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box bg={bg} color={color} minH="100vh" p={8}>
      <Flex direction="column" maxW="800px" mx="auto">
        
        {/* Top controls header */}
        <Flex justify="space-between" align="center" mb={8} borderBottom="2px" borderColor="orange.500" pb={4}>
          <Button 
            onClick={handleBack} 
            leftIcon={<ArrowBackIcon />} 
            variant="outline" 
            colorScheme="orange"
          >
            Back
          </Button>
          <Heading size="xl" color="orange.400" textAlign="center">
            <FaTicketAlt style={{ display: 'inline', marginRight: '10px' }} />
            Ticket Verification
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

        <VStack spacing={6} bg={panelBg} borderColor={panelBorder} borderWidth="1px" p={8} borderRadius="xl" boxShadow="lg">
          <Flex width="100%" direction={{ base: 'column', md: 'row' }} gap={4}>
            <Input
              placeholder="Enter Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              size="lg"
              bg={inputBg}
              color={color}
              borderColor={inputBorder}
              _hover={{ borderColor: 'orange.400' }}
              _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px orange.500' }}
            />
            <Button
              colorScheme="orange"
              size="lg"
              leftIcon={<FaCheck />}
              onClick={() => handleVerifyTicket()}
              isLoading={isVerifying}
              loadingText="Verifying..."
              flexShrink={0}
            >
              Verify
            </Button>
            <Button
              variant="outline"
              colorScheme="orange"
              size="lg"
              leftIcon={<FaSearch />}
              onClick={() => handleGetTicketDetails()}
              isLoading={loading}
              loadingText="Loading..."
              flexShrink={0}
            >
              Details
            </Button>
          </Flex>

          <Button
            colorScheme="teal"
            size="lg"
            width="full"
            leftIcon={<FaQrcode />}
            onClick={() => setIsScanning(true)}
          >
            Scan QR Code
          </Button>

          {ticketData && (
            <Box w="100%" mt={6} p={6} bg={resultBg} borderRadius="lg">
              <Heading size="md" mb={4} color="orange.400">
                Verification Result
              </Heading>
              <VStack align="start" spacing={3}>
                <Text>
                  <strong>Status:</strong> {getStatusBadge(ticketData.isVerified)}
                </Text>
                <Text>
                  <strong>Attendee:</strong> {ticketData.attendeeName || 'N/A'}
                </Text>
                {ticketData.attendees && ticketData.attendees.length > 0 && (
                  <Box w="100%">
                    <Text mb={2}><strong>Additional Attendees:</strong></Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="orange.400">Name</Th>
                          <Th color="orange.400">Email</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ticketData.attendees.map((attendee, index) => (
                          <Tr key={index}>
                            <Td>{attendee.name}</Td>
                            <Td>{attendee.email}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </Flex>

      {/* Camera Scanning Modal */}
      <Modal isOpen={isScanning} onClose={() => setIsScanning(false)} size="md">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={color}>
          <ModalHeader color="orange.400">Scan Ticket QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>Position the QR code inside the camera viewfinder frame below to scan.</Text>
            <Box borderRadius="lg" overflow="hidden" border="2px" borderColor="orange.450" bg="black" minH="250px">
              <div id="qr-reader" style={{ width: '105%' }}></div>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsScanning(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={color}>
          <ModalHeader color="orange.400">Ticket Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {ticketData ? (
              <VStack spacing={4} align="start">
                <Flex justify="space-between" w="100%">
                  <Text><strong>Ticket ID:</strong> {ticketData.ticketId}</Text>
                  {getStatusBadge(ticketData.isVerified)}
                </Flex>
                
                <Box>
                  <Heading size="sm" color="orange.400" mb={2}>Event Information</Heading>
                  <Text><strong>Event:</strong> {ticketData.eventName || 'N/A'}</Text>
                  <Text><strong>Date:</strong> {ticketData.eventDate ? new Date(ticketData.eventDate).toLocaleString() : 'N/A'}</Text>
                  <Text><strong>Location:</strong> {ticketData.eventLocation || 'N/A'}</Text>
                </Box>

                <Box>
                  <Heading size="sm" color="orange.400" mb={2}>Attendee Information</Heading>
                  <Text><strong>Primary Attendee:</strong> {ticketData.attendeeName || 'N/A'}</Text>
                  <Text><strong>Email:</strong> {ticketData.email || 'N/A'}</Text>
                </Box>

                {ticketData.attendees && ticketData.attendees.length > 0 && (
                  <Box w="100%">
                    <Heading size="sm" color="orange.400" mb={2}>Additional Attendees</Heading>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="orange.400">Name</Th>
                          <Th color="orange.400">Email</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ticketData.attendees.map((attendee, index) => (
                          <Tr key={index}>
                            <Td>{attendee.name}</Td>
                            <Td>{attendee.email}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}

                {ticketData.isVerified && (
                  <Tag colorScheme="red" size="lg" mt={4}>
                    <TagLabel>Verified at: {new Date(ticketData.verifiedAt).toLocaleString()}</TagLabel>
                  </Tag>
                )}
              </VStack>
            ) : (
              <Spinner size="xl" color="orange.400" />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TicketVerification;
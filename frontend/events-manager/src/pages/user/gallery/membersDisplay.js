import React, { useEffect, useState } from 'react';
import {
  Box, Flex, Heading, SimpleGrid, Image, Text,
  Spinner, useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Badge, VStack, Button,
  useColorMode, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { api } from '../../../actions/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';

const UserGalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const { colorMode, toggleColorMode } = useColorMode();
  const { galleryCache, setGalleryCache, user } = useUser();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("gray.50", "black");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const modalBg = useColorModeValue("white", "gray.900");

  const fetchGallery = async () => {
    // Check cache first
    if (galleryCache) {
      setGallery(galleryCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${api}/gallery`);
      setGallery(response.data);
      setGalleryCache(response.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery');
      toast({
        title: 'Error',
        description: 'Failed to fetch gallery members',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    onOpen();
  };

  const handleBack = () => {
    if (user) {
      if (user.isAdmin) {
        navigate(`/admin/${user._id}`);
      } else {
        navigate(`/home/${user._id}`);
      }
    } else {
      navigate(-1);
    }
  };

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

  return (
    <Box bg={bg} color={color} minH="100vh" py={8} px={4}>
      {/* Top Header controls */}
      <Flex justify="space-between" align="center" mb={10} borderBottom="2px" borderColor="orange.500" pb={4}>
        <Button 
          onClick={handleBack} 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          colorScheme="orange"
        >
          Back
        </Button>
        <Heading size="xl" color="orange.400" textAlign="center">
          Our Team Gallery
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

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8} px={4}>
        {gallery.map((member) => (
          <Box
            key={member._id}
            bg={cardBg}
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(255, 140, 0, 0.4)',
              borderColor: 'orange.400'
            }}
            transition="all 0.3s ease"
            cursor="pointer"
            onClick={() => handleMemberClick(member)}
          >
            <Image
              src={member.photoBase64}
              alt={member.name}
              w="100%"
              h="250px"
              objectFit="cover"
              borderTopRadius="xl"
            />
            <Box p={4}>
              <Heading size="md" color="orange.400" mb={1}>
                {member.name}
              </Heading>
              <Text color="gray.400" fontSize="sm" mb={1}>
                {member.class}
              </Text>
              <Badge colorScheme={getRoleColor(member.role)} borderRadius="full" px={2}>
                {member.role.toUpperCase()}
              </Badge>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Member Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={color} border="1px" borderColor="orange.400">
          <ModalHeader color="orange.400">{selectedMember?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedMember && (
              <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                <Box flex={1}>
                  <Image
                    src={selectedMember.photoBase64}
                    alt={selectedMember.name}
                    borderRadius="xl"
                    w="100%"
                    maxH="400px"
                    objectFit="cover"
                  />
                </Box>
                <Box flex={1}>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="orange.400">Class:</Text>
                      <Text>{selectedMember.class || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="orange.400">Registration Number:</Text>
                      <Text>{selectedMember.regno}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="orange.400">Role:</Text>
                      <Badge colorScheme={getRoleColor(selectedMember.role)} fontSize="md">
                        {selectedMember.role.toUpperCase()}
                      </Badge>
                    </Box>
                  </VStack>
                </Box>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Helper function to get color based on role
const getRoleColor = (role) => {
  switch (role) {
    case 'leader': return 'red';
    case 'coordinator': return 'blue';
    case 'mentor': return 'purple';
    default: return 'orange';
  }
};

export default UserGalleryPage;
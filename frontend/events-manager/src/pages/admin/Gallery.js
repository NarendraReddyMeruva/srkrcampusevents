import React, { useEffect, useState } from 'react';
import {
  Box, Button, Image, Input, Stack, Text, VStack, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useToast, IconButton, SimpleGrid, Select, Flex, Heading, useColorMode, useColorModeValue
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../../actions/api';
import { useUser } from '../../context/UserContext';

const GalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    _id: '',
    name: '',
    regno: '',
    role: 'member',
    photoBase64: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const { colorMode, toggleColorMode } = useColorMode();
  const { user, galleryCache, setGalleryCache, clearCache } = useUser();

  // Theme values
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const cardBg = useColorModeValue("gray.50", "black");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const modalBg = useColorModeValue("white", "gray.850");
  const optionBg = useColorModeValue('#FFFFFF', '#1A202C');

  const roles = ['member', 'coordinator', 'leader', 'mentor'];

  const fetchGallery = async () => {
    // Check cache first
    if (galleryCache) {
      setGallery(galleryCache);
      return;
    }

    try {
      const res = await axios.get(api + '/gallery');
      setGallery(res.data);
      setGalleryCache(res.data);
    } catch (error) {
      toast({
        title: 'Error fetching gallery',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => { 
    fetchGallery(); 
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        photoBase64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.regno || !formData.photoBase64) {
      toast({
        title: 'Error',
        description: 'All fields except role are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await axios.put(`${api}/gallery/${formData._id}`, formData);
        toast({
          title: 'Success',
          description: 'Member updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(api + '/admingallery', formData);
        toast({
          title: 'Success',
          description: 'Member added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Invalidate gallery cache
      clearCache('gallery');

      // Refetch manually to update local state
      const res = await axios.get(api + '/gallery');
      setGallery(res.data);
      setGalleryCache(res.data);

      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: isEditing ? 'Error updating member' : 'Error adding member',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setFormData({
      _id: member._id,
      name: member.name,
      regno: member.regno,
      role: member.role,
      photoBase64: member.photoBase64
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${api}/gallery/${id}`);
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Invalidate gallery cache
      clearCache('gallery');

      // Refetch
      const res = await axios.get(api + '/gallery');
      setGallery(res.data);
      setGalleryCache(res.data);
    } catch (error) {
      toast({
        title: 'Error deleting member',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({ 
      _id: '',
      name: '',
      regno: '',
      role: 'member',
      photoBase64: '' 
    });
    setIsEditing(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (user) {
      navigate(`/admin/${user._id}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box bg={bg} minH="100vh" color={color} p={4}>
      {/* Top Header controls */}
      <Flex justify="space-between" align="center" mb={6} borderBottom="2px" borderColor="orange.500" pb={4}>
        <Button 
          onClick={handleBack} 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          colorScheme="orange"
        >
          Back
        </Button>
        <Heading size="xl" color="orange.400" textAlign="center">
          Manage Gallery
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

      <Button 
        onClick={onOpen} 
        colorScheme="orange" 
        mb={6}
        leftIcon={<FaPlus />}
      >
        Add Member
      </Button>
      
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
        {gallery.map(member => (
          <Box 
            key={member._id} 
            p={4} 
            bg={cardBg} 
            borderColor={cardBorder}
            borderWidth="1px"
            borderRadius="xl" 
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'orange.400' }}
          >
            {member.photoBase64 && (
              <Image
                src={member.photoBase64}
                alt={member.name}
                borderRadius="lg"
                mb={3}
                h="200px"
                w="100%"
                objectFit="cover"
              />
            )}
            <Text fontSize="xl" fontWeight="bold">{member.name}</Text>
            <Text>Reg No: {member.regno}</Text>
            <Text>Role: {member.role}</Text>
            <Stack direction="row" spacing={2} mt={3}>
              <IconButton
                aria-label="Edit member"
                icon={<FaEdit />}
                colorScheme="blue"
                onClick={() => handleEditMember(member)}
              />
              <IconButton
                aria-label="Delete member"
                icon={<FaTrash />}
                colorScheme="red"
                onClick={() => handleDelete(member._id)}
              />
            </Stack>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={color}>
          <ModalHeader>{isEditing ? 'Edit Member' : 'Add New Member'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                bg={bg}
              />
              <Input 
                placeholder="Registration Number" 
                value={formData.regno}
                onChange={e => setFormData({ ...formData, regno: e.target.value })} 
                bg={bg}
              />
              <Select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                bg={bg}
              >
                {roles.map(role => (
                  <option key={role} value={role} style={{ background: optionBg, color: '#ED8936' }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </Select>
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                pt={1}
                bg={bg}
              />
              {formData.photoBase64 && (
                <Image 
                  src={formData.photoBase64} 
                  alt="Preview" 
                  maxH="200px" 
                  mt={2}
                  borderRadius="md"
                />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="orange" 
              onClick={handleAddMember}
              isLoading={isLoading}
              mr={3}
            >
              {isEditing ? 'Update' : 'Submit'}
            </Button>
            <Button onClick={handleModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryPage;


import { Link } from 'react-router-dom';
import { Button, Flex, VStack, Image, useColorMode, useColorModeValue, IconButton } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import logo from "../../assets/srkrlogo.jpeg"

export const LandingPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const buttonBorder = useColorModeValue("black", "white");
  const buttonHoverBg = useColorModeValue("black", "white");
  const buttonHoverColor = useColorModeValue("white", "black");

  return (
    <Flex
      minH="100vh"
      bg={bg}
      color={color}
      alignItems="center"
      justifyContent="center"
      p={10}
      position="relative"
    >
      {/* Theme Toggle Icon at Top Right */}
      <IconButton
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        aria-label="Toggle Theme"
        position="absolute"
        top={4}
        right={4}
        variant="ghost"
        color={colorMode === 'light' ? 'black' : 'white'}
        size="lg"
      />

      <VStack spacing={12} maxW="100%" w="full" px={{ base: 4, md: 0 }}>
        <Image 
          src={logo}
          alt="SRKR Logo"
          boxSize={{ base: '60px', md: '100px' }}
          objectFit="contain"
        />

        <VStack spacing={4} w="full" maxW="500px">
          <Button
            as={Link}
            to="/adminsignin"
            variant="outline"
            borderColor={buttonBorder}
            color={color}
            size="lg"
            width="full"
            fontSize={"20px"}
            _hover={{ bg: buttonHoverBg, color: buttonHoverColor }}
          >
            Admin Login
          </Button>

          <Button
            as={Link}
            to="/signin"
            variant="outline"
            borderColor={buttonBorder}
            color={color}
            size="lg"
            width="full"
            fontSize={"20px"}
            _hover={{ bg: buttonHoverBg, color: buttonHoverColor }}
          >
            Student Login
          </Button>

          <Button
            as={Link}
            to="/home/688b6a37ce4a6a16fc2de37c"
            variant="outline"
            borderColor={buttonBorder}
            color={color}
            size="lg"
            width="full"
            fontSize={"20px"}
            _hover={{ bg: buttonHoverBg, color: buttonHoverColor }}
          >
            Continue as Guest
          </Button>
        </VStack>
      </VStack>
    </Flex>
  );
};
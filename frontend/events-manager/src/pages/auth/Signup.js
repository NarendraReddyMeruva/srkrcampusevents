import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Heading,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
  IconButton,
  useToast
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useState } from "react";
import { api } from "../../actions/api";
import { Link, useNavigate } from "react-router-dom";

export const SignUp = () => {
  const [name, setName] = useState("");
  const [mobilenumber, setMobileNumber] = useState("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue("white", "black");
  const formBg = useColorModeValue("gray.50", "gray.900");
  const formBorder = useColorModeValue("gray.200", "gray.700");
  const color = useColorModeValue("black", "white");
  const inputBg = useColorModeValue("white", "gray.800");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const helperColor = useColorModeValue("gray.500", "gray.400");

  const Signup = async () => {
    if (!name || !mobilenumber || !dateofbirth || !email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(api + "/signup", {
        name,
        mobilenumber,
        dateofbirth,
        email,
        password,
      });

      if (res.data.message) {
        toast({
          title: "Signup Successful",
          description: "Your student account has been created. Redirecting to login...",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        setTimeout(() => navigate("/signin"), 2500);
      } else if (res.data.error) {
        toast({
          title: "Signup Error",
          description: res.data.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Signup Error",
          description: "Unknown error. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        title: "Signup Error",
        description: "An error occurred during signup. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg={bg}
      color={color}
      px={4}
      py={10}
      position="relative"
    >
      {/* Back Button */}
      <IconButton
        icon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        aria-label="Back to Home"
        position="absolute"
        top={4}
        left={4}
        variant="ghost"
        color={colorMode === 'light' ? 'black' : 'white'}
        size="lg"
      />

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

      <Box
        width="100%"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius="xl"
        boxShadow="xl"
        bg={formBg}
        borderColor={formBorder}
      >
        <Heading as="h2" size="lg" textAlign="center" mb={6} color="orange.400" fontWeight="bold">
          Sign Up
        </Heading>

        <FormControl mb={4} isRequired>
          <FormLabel fontWeight="semibold">Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter your name"
            bg={inputBg}
            borderColor={inputBorder}
            color={color}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel fontWeight="semibold">Mobile Number</FormLabel>
          <Input
            type="number"
            placeholder="Enter your Mobile number"
            bg={inputBg}
            borderColor={inputBorder}
            color={color}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel fontWeight="semibold">Date of Birth</FormLabel>
          <Input
            type="date"
            bg={inputBg}
            borderColor={inputBorder}
            color={color}
            onChange={(e) => setDateofbirth(e.target.value)}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel fontWeight="semibold">Email address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            bg={inputBg}
            borderColor={inputBorder}
            color={color}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormHelperText color={helperColor}>We'll never share your email.</FormHelperText>
        </FormControl>

        <FormControl mb={6} isRequired>
          <FormLabel fontWeight="semibold">Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            bg={inputBg}
            borderColor={inputBorder}
            color={color}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormHelperText color={helperColor}>Make sure your password is strong.</FormHelperText>
        </FormControl>

        <Button
          colorScheme="orange"
          size="lg"
          width="full"
          onClick={Signup}
          _hover={{
            bg: useColorModeValue("black", "white"),
            color: useColorModeValue("white", "black"),
          }}
        >
          Sign Up
        </Button>

        <Text textAlign="center" mt={4} color="gray.400">
          Already have an account?{" "}
          <Link to={"/signin"} style={{ color: "#ED8936", fontWeight: "semibold", textDecoration: "underline" }}>
            Sign in!
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default SignUp;

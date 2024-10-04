import {configuration} from "../configuration";
import axios from "axios";
import * as crypto from 'crypto';

export type Profile = {
  first_name: string
  last_name: string
  username: string
  avatar_url: string
  email: string
}

export async function getProfile(): Promise<Profile | undefined> {
  try {
    const {data, status} = await axios.get<Profile>(configuration.PROFILE_URL, {withCredentials: true});
    if (status === 200) {
      return data
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

export async function deleteProfile(): Promise<void> {
  const {status} = await axios.delete(configuration.PROFILE_URL, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error deleting profile");
  }
}

export async function updateFirstName(firstName: string): Promise<void> {
  const {status} = await axios.patch(configuration.PROFILE_URL, {first_name: firstName}, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error updating first name");
  }
}

export async function updateLastName(lastName: string): Promise<void> {
  const {status} = await axios.patch(configuration.PROFILE_URL, {last_name: lastName}, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error updating last name");
  }
}

export async function updateUsername(username: string): Promise<void> {
  const {status} = await axios.patch(configuration.PROFILE_URL, {username: username}, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error updating username");
  }
}

function hashPassword(password: string): string {
  const salt = 'linkuratorsalt';
  const saltedPassword = salt + password;
  return crypto.createHash('sha256').update(saltedPassword).digest('hex');
}

export async function login(email: string, password: string): Promise<void> {
  const hashedPassword = hashPassword(password);
  const {status} = await axios.post(configuration.LOGIN_EMAIL_URL, {
    email: email,
    password: hashedPassword
  }, {withCredentials: true});
  if (status !== 200) {
    throw new Error("Error logging in");
  }
}

export async function register(
  firstName: string, lastName: string, username: string, email: string, password: string,
): Promise<void> {
  const hashedPassword = hashPassword(password);
  const {status} = await axios.post(configuration.REGISTER_EMAIL_URL, {
    email: email,
    password: hashedPassword,
    first_name: firstName,
    last_name: lastName,
    username: username,
    validation_base_url: configuration.REGISTER_VALIDATE_BASE_URL
  }, {withCredentials: true});
  if (status !== 201) {
    throw new Error("Error registering");
  }
}

export async function validateNewAccountRequest(requestId: string): Promise<boolean> {
  const {status} = await axios.get(configuration.VALIDATE_EMAIL_URL + requestId, {withCredentials: true});
  return status === 200;
}

export async function forgotPassword(email: string): Promise<void> {
  const {status} = await axios.post(configuration.FORGOT_PASSWORD_URL,
    {email: email, validate_url: configuration.FORGOT_PASSWORD_BASE_URL});
  if (status !== 204) {
    throw new Error("Error sending forgot password email");
  }
}

export async function changePassword(password: string, requestId: string): Promise<void> {
  const hashedPassword = hashPassword(password);
  const {status} = await axios.post(configuration.FORGOT_PASSWORD_URL + requestId,
    {new_password: hashedPassword});
  if (status !== 204) {
    throw new Error("Error changing password");
  }
}
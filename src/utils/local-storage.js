import { getStorage, setStorage } from "../hooks/use-local-storage";
import { PROFILES_ID_OPENING } from "./constance";

export const addProfileOpen = (profile_id) => {
    const profileOpenIds = getStorage(PROFILES_ID_OPENING) || [];

    if (profileOpenIds.includes(profile_id)) return;
    profileOpenIds.push(profile_id);
    setStorage(PROFILES_ID_OPENING, profileOpenIds);
};

export const removeProfileOpen = (profile_id) => {
    const profileOpenIds = getStorage(PROFILES_ID_OPENING) || [];
    const newProfileOpenIds = profileOpenIds.filter((id) => id !== profile_id);
    setStorage(PROFILES_ID_OPENING, newProfileOpenIds);
};

export const removeAllProfileOpen = () => {
    setStorage(PROFILES_ID_OPENING, []);
};

export const appendVariableState = (data) => {
    const variableState = getStorage("variableState") || [];
    variableState.push(data);
    setStorage("variableState", variableState);
}
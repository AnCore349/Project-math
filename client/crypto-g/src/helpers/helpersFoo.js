export const getLocalStorage = (necessary) => {
    let itemFromLocalStorage = localStorage.getItem(necessary);
    return JSON.parse(itemFromLocalStorage)
}

export const setLocalStorage = (payloadForLocalStorage, nameForItemLocalStorage) => {
    const dataToStringRegister = JSON.stringify(payloadForLocalStorage)
    localStorage.setItem(nameForItemLocalStorage, dataToStringRegister);
}

const readStoredSession = (storage) => {
    try {
        return JSON.parse(storage.getItem('rememberMe'))
    } catch (error) {
        storage.removeItem('rememberMe')
        return null
    }
}

export const getAuthSession = () =>
    readStoredSession(localStorage) || readStoredSession(sessionStorage)

export const isRememberedSession = () => Boolean(readStoredSession(localStorage))

export const setAuthSession = (session, rememberMe) => {
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('rememberMe')
    localStorage.removeItem('authRememberChoice')
    sessionStorage.removeItem('authRememberChoice')
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('rememberMe', JSON.stringify(session))
}

export const clearAuthSession = () => {
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('rememberMe')
    localStorage.removeItem('authRememberChoice')
    sessionStorage.removeItem('authRememberChoice')
}

export const setAuthRememberChoice = (rememberMe) => {
    localStorage.removeItem('authRememberChoice')
    sessionStorage.removeItem('authRememberChoice')
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('authRememberChoice', rememberMe ? '1' : '0')
}

export const getAuthRememberChoice = () => {
    const rememberMe = localStorage.getItem('authRememberChoice') ||
        sessionStorage.getItem('authRememberChoice')
    localStorage.removeItem('authRememberChoice')
    sessionStorage.removeItem('authRememberChoice')
    return rememberMe === null ? true : rememberMe === '1'
}
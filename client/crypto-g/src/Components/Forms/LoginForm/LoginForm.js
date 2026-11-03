import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {NeonInput} from "../../common/Inputs/NeonInput/NeonInput";
import {LinkBoxLog, RegisterBox} from "./loginForm.style";
import {Form, LineBox, ButtonBox, AuthMessage} from "../commonStylesForm/common.styles";
import {Checkbox} from "../../common/Inputs/CheckBox/Checkbox";
import {Glassbtn} from "../../common/Buttons/Glassbutton/Glassbutton";
import {colors} from "../../../styles-common/common.style";
import AuthStore from "../../../store/authentication/auth.store"

export const LoginForm = observer(({handleLinkToRegister}) => {

    const [login, setLoginState] = useState('')
    const [password, setPasswordState] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const handleFormEmail = (payloadInputLogin) => {
        AuthStore.clearError()
        setLoginState(payloadInputLogin)
    }
    const handleFormPassword = (payloadInputPassword) => {
        AuthStore.clearError()
        setPasswordState(payloadInputPassword)
    }

    const addToStoreDataLogin = async (e) => {
        e.preventDefault()
        if (login && password) await AuthStore.handleAddCredoLogin({email: login, password}, rememberMe)
    }

    const requestPasswordReset = async (e) => {
        e.preventDefault()
        if (login) await AuthStore.requestPasswordReset(login)
    }

    if (isForgotPassword) {
        return (
            <Form onSubmit={requestPasswordReset}>
                <NeonInput
                    typeInput={'email'}
                    onFormHandle={handleFormEmail}
                    labelText={'Email'}
                    placeholderText={'Enter your account email'}
                    required
                />
                {AuthStore.error && <AuthMessage role="alert">{AuthStore.error}</AuthMessage>}
                {AuthStore.resetMessage && <AuthMessage role="status">{AuthStore.resetMessage}</AuthMessage>}
                <ButtonBox>
                    <Glassbtn
                        buttonType="submit"
                        text={AuthStore.isSubmitting ? 'Sending…' : 'Send reset link'}
                        disabled={AuthStore.isSubmitting}
                    />
                    <Glassbtn
                        buttonType="button"
                        text={'Back to login'}
                        handleClick={() => {
                            AuthStore.clearError()
                            setIsForgotPassword(false)
                        }}
                    />
                </ButtonBox>
            </Form>
        )
    }

    return (
        <Form onSubmit={addToStoreDataLogin}>
            <NeonInput
                typeInput={'email'}
                onFormHandle={handleFormEmail}
                labelText={'Email'}
                placeholderText={'Enter your email'}
                required
            />
            <NeonInput
                typeInput={'password'}
                onFormHandle={handleFormPassword}
                labelText={'Password'}
                placeholderText={'Enter your password'}
                required
            />
            {AuthStore.error && <AuthMessage role="alert">{AuthStore.error}</AuthMessage>}
            <LineBox>
                <Checkbox checkboxText={'Remember Me'} checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                <LinkBoxLog>
                    <button type="button" onClick={() => {
                        AuthStore.clearError()
                        setIsForgotPassword(true)
                    }}>
                        Forgot password?
                    </button>
                </LinkBoxLog>
            </LineBox>
            <RegisterBox>
                <Glassbtn
                    buttonType={'button'}
                    background={colors.transparentBackgroundZero}
                    text={'Registration'}
                    handleClick={handleLinkToRegister}
                    fontSize={'0.9'}
                />
            </RegisterBox>
            <ButtonBox>
                <Glassbtn
                    buttonType={'button'}
                    text={'Login with Google'}
                    fontSize={'1'}
                    handleClick={() => AuthStore.startGoogleLogin(rememberMe)}
                    disabled={AuthStore.isSubmitting}
                />
                <Glassbtn
                    buttonType="submit"
                    padding={'8px 30px 8px 30px'}
                    text={AuthStore.isSubmitting ? 'Logging in…' : 'Login'}
                    fontSize={'1'}
                    disabled={AuthStore.isSubmitting}
                />
            </ButtonBox>
        </Form>
    )
})
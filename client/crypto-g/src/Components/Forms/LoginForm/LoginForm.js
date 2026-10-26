import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {NeonInput} from "../../common/Inputs/NeonInput/NeonInput";
import {LinkBoxLog, RegisterBox} from "./loginForm.style";
import {Form, LineBox, ButtonBox, AuthMessage} from "../commonStylesForm/common.styles";
import {Checkbox} from "../../common/Inputs/CheckBox/Checkbox";
import {Link} from "../../common/Links/Link";
import {Glassbtn} from "../../common/Buttons/Glassbutton/Glassbutton";
import {colors} from "../../../styles-common/common.style";
import AuthStore from "../../../store/authentication/auth.store"

export const LoginForm = observer(({handleLinkToRegister}) => {

    const [login, setLoginState] = useState('')
    const [password, setPasswordState] = useState('')

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
        if (login && password) await AuthStore.handleAddCredoLogin({email: login, password})
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
                <Checkbox checkboxText={'Remember Me'}/>
                <LinkBoxLog>
                    <Link textLink={'Forgot password'} />
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
                    disabled
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
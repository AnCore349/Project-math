import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {NeonInput} from "../../common/Inputs/NeonInput/NeonInput";
import {LinkBoxReg} from "./registerForm.style";
import {Form, LineBox, AuthMessage} from "../commonStylesForm/common.styles"
import {Glassbtn} from "../../common/Buttons/Glassbutton/Glassbutton";
import {colors} from "../../../styles-common/common.style";
import AuthStore from "../../../store/authentication/auth.store";

export const RegisterForm = observer(({handleLinkToLogin}) => {

    const [nickname, setNicknameRegister] = useState('')
    const [email, setEmailRegister] = useState('')
    const [password, setPasswordRegister] = useState('')

    const handleFormEmailRegister = (payloadInputLogin) => {
        AuthStore.clearError()
        setEmailRegister(payloadInputLogin)
    }
    const handleFormPasswordRegister = (payloadInputPassword) => {
        AuthStore.clearError()
        setPasswordRegister(payloadInputPassword)
    }
    const handleFormNicknameRegister = (payloadInputPassword) => {
        AuthStore.clearError()
        setNicknameRegister(payloadInputPassword)
    }

    const addToStoreDataRegister = async (e) => {
        e.preventDefault()
        if (nickname.trim() && email && password) {
            await AuthStore.handleAddCredoRegister({email, password, nickname: nickname.trim()})
        }
    }

    return (
        <Form onSubmit={addToStoreDataRegister}>
            <NeonInput onFormHandle={handleFormNicknameRegister} labelText={'Nickname'} placeholderText={'Enter your nickname'} required/>
            <NeonInput onFormHandle={handleFormEmailRegister} typeInput="email" labelText={'Email'} placeholderText={'Enter your email'} required/>
            <NeonInput onFormHandle={handleFormPasswordRegister} typeInput="password" labelText={'Password'} placeholderText={'Enter your password'} required/>
            {AuthStore.error && <AuthMessage role="alert">{AuthStore.error}</AuthMessage>}
            <LineBox>
                {/*<Checkbox clue={"LogIn and Remember Me."} checkboxText={'Auto LogIn'}/>*/}
                <LinkBoxReg>
                    <Glassbtn
                        buttonType={'submit'}
                        padding={'8px 30px 8px 30px'}
                        text={'Registration'}
                        fontSize={'1'}
                        disabled={AuthStore.isSubmitting}
                    />
                    <Glassbtn
                        buttonType={'button'}
                        background={colors.transparentBackgroundZero}
                        text={'Link to Login'}
                        handleClick={handleLinkToLogin}
                        fontSize={'0.9'}
                    />
                </LinkBoxReg>
            </LineBox>
        </Form>
    )
})
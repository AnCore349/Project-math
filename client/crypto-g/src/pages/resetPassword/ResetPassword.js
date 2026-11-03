import React, {useState} from "react";
import {useLocation} from "react-router-dom";
import {POST} from "../../store/requests/request";
import {RESET_PASSWORD_ROUTE} from "../../serverRouting/switch";
import {NeonInput} from "../../Components/common/Inputs/NeonInput/NeonInput";
import {AuthMessage, ButtonBox, Form} from "../../Components/Forms/commonStylesForm/common.styles";
import {Glassbtn} from "../../Components/common/Buttons/Glassbutton/Glassbutton";

export const ResetPassword = () => {
    const location = useLocation()
    const token = new URLSearchParams(location.search).get('token')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')
        if (!token) {
            setError('This password reset link is invalid or incomplete.')
            return
        }
        if (password !== confirmation) {
            setError('Passwords do not match.')
            return
        }

        setIsSubmitting(true)
        try {
            const {data} = await POST(RESET_PASSWORD_ROUTE, {token, password})
            setMessage(data.message)
        } catch (requestError) {
            const responseMessage = requestError?.response?.data?.message
            setError(Array.isArray(responseMessage) ? responseMessage.join(', ') : responseMessage || 'Could not reset your password. Request a new link and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form onSubmit={submit}>
            <h2>Reset your password</h2>
            <NeonInput typeInput="password" labelText="New password" placeholderText="Enter a new password" onFormHandle={setPassword} required minLength={8}/>
            <NeonInput typeInput="password" labelText="Confirm password" placeholderText="Enter the new password again" onFormHandle={setConfirmation} required minLength={8}/>
            {error && <AuthMessage role="alert">{error}</AuthMessage>}
            {message && <AuthMessage role="status">{message}</AuthMessage>}
            <ButtonBox>
                <Glassbtn buttonType="submit" text={isSubmitting ? 'Saving…' : 'Reset password'} disabled={isSubmitting || Boolean(message)}/>
                <a href="/">Back to login</a>
            </ButtonBox>
        </Form>
    )
}

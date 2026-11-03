import React from "react";
import {CheckboxNeon} from "./checkbox.style";

export const Checkbox = ({checkboxText, clue, checked, onChange}) => {
    return (
        <CheckboxNeon title={clue}>
            <input type={'checkbox'} id={'cb1'} checked={checked} onChange={onChange}/>
            <label htmlFor="cb1">{checkboxText}</label>
        </CheckboxNeon>
    )
}
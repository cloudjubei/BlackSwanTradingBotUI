import React, { FC } from 'react'
import { TextField, TextFieldProps } from '@mui/material'
import { RegisterOptions, useFormContext } from 'react-hook-form'

interface FormRegistrationProps {
	formField?: string
	formValidation?: RegisterOptions
}

export type TextInputProps = FormRegistrationProps & TextFieldProps

export const TextInput: FC<TextInputProps> = (props: TextInputProps): JSX.Element => {
	const form = useFormContext()
	const { children, formField, formValidation, ...rest } = props

	const error = formField ? form?.formState?.errors?.[formField] : undefined
	let errorMessage: string | undefined
	if (error) {
		// Quick-fix: updated react-hook-form and this broke
		if (error.message) {
			errorMessage = error!.message as any
		} else if ((error?.type as any) === 'min') {
			errorMessage = `Must be greater than ${formValidation?.min}`
		} else if ((error?.type as any) === 'max') {
			errorMessage = `Must be less than ${formValidation?.max}`
		} else if ((error?.type as any) === 'required') {
			errorMessage = `${props.label ?? 'Field'} required!`
		}
		// TODO add more errorMessages as needed
	}

	let registration: any = {}
	if (formField) {
		registration = form.register(formField, formValidation)
	}

	return (
		<TextField className='text-input' error={Boolean(error)} helperText={errorMessage} {...registration} {...rest}>
			{children}
		</TextField>
	)
}

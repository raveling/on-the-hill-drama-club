"use client"
import { signIn } from "next-auth/react";
import { useRef, useState } from "react";
import ErrorPop from "./ErrorPop";
import SuccessPop from "./SuccessPop";
import { Turnstile, TurnstileProps, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useRouter } from "next/navigation";

interface Values {
    firstName: string;
    surname: string;
    password: string;
    passwordConfirmation: string;
    email: string;
    phone: string;
    suburb: string;
    postcode: string;
    streetAddress: string;
    turnstileRes: string;
};

export default function RegisterForm({ callbackUrl }: { callbackUrl: string, csrfToken?: string }) {
    const router = useRouter();
    const ref = useRef<TurnstileInstance | undefined>(null);
    const initialValues = {
        firstName: '',
        surname: '',
        phone: '',
        suburb: '',
        postcode: '',
        streetAddress: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        turnstileRes: '',
    }


    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const onSubmit = async (values: Values) => {

        const data = values
        console.log(data.turnstileRes);

        ref.current?.reset();
        setLoading(true);
        if (data.password !== data.passwordConfirmation) {
            setError(true);
            setLoading(false);
            return;
        }
        if (data.password.length < 8) {
            setError(true);
            setLoading(false);
            return;
        }
        if (data.phone.length < 10) {
            setError(true);
            setLoading(false);
            return;
        }
        if (data.postcode.length < 4) {
            setError(true);
            setLoading(false);
            return;
        }
        if (data.turnstileRes === 'undefined') {
            setError(true);
            setLoading(false);
            return;
        }
        try {
            const result = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!result.ok) {
                setError(true);
                throw new Error(result.statusText);
            }
            const newToken = ref.current?.getResponse()
            const auth = await signIn('credentials', { redirect: false, email: data.email, password: data.password, callbackUrl, turnstileRes: newToken })
            if (!auth || auth.error) {
                setError(true);
                throw new Error(auth?.error || 'Authentication failed');
            }
            if (auth.ok) {
                setSuccess(true);
                setLoading(false);
                router.push('/dashboard/students/add')
            } else {
                setError(true);
                setLoading(false);
            }
        } catch (error) {
            setError(true);
            setLoading(false);
            throw error;
        }

    }

    return (
        <>
            <Formik initialValues={initialValues} onSubmit={(
                values: Values,
                { setSubmitting, }: FormikHelpers<Values>
            ) => { onSubmit(values) }}>
                {({

                    values,

                    errors,

                    touched,

                    handleChange,

                    handleBlur,

                    handleSubmit,

                    isSubmitting,

                    /* and other goodies */

                }) => (
                    <>
                        <form className='space-y-6' onSubmit={handleSubmit}>
                            <div className="shadow sm:overflow-hidden sm:rounded-md">
                                <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                                        <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can recieve mail.</p>
                                    </div>

                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                                Your First Name
                                            </label>
                                            <input
                                                title="Please enter your first name."
                                                value={values.firstName}
                                                onChange={handleChange}
                                                type="text"
                                                name="firstName"
                                                id="firstName"
                                                autoComplete="given-name"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                                Your Last Name
                                            </label>
                                            <input
                                                title="Please enter your last name."
                                                value={values.surname}
                                                onChange={handleChange}
                                                type="text"
                                                name="surname"
                                                id="surname"
                                                autoComplete="family-name"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <input
                                                title='Please enter a valid phone number.'
                                                value={values.phone}
                                                onChange={handleChange}
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                autoComplete="phone"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                                Email address
                                            </label>
                                            <input
                                                title='Please enter a valid email address.'
                                                value={values.email}
                                                onChange={handleChange}
                                                type="text"
                                                name="email"
                                                id="email"
                                                autoComplete="email"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <input

                                                value={values.password}
                                                onChange={handleChange}
                                                type="password"
                                                name="password"
                                                id="password"
                                                autoComplete="new-password"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700">
                                                Confirm Passwordf
                                            </label>
                                            <input
                                                title='Passwords must match.'
                                                value={values.passwordConfirmation}
                                                onChange={handleChange}
                                                type="password"
                                                name="passwordConfirmation"
                                                id="passwordConfirmation"
                                                autoComplete="new-password"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>


                                        <div className="col-span-6">
                                            <label htmlFor="street-address" className="block text-sm font-medium text-gray-700">
                                                Street address
                                            </label>
                                            <input
                                                title='Please enter a valid street address.'
                                                value={values.streetAddress}
                                                onChange={handleChange}
                                                type="text"
                                                name="streetAddress"
                                                id="streetAddress"
                                                autoComplete="street-address"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                                Suburb
                                            </label>
                                            <input
                                                title="Please enter a valid suburb."
                                                value={values.suburb}
                                                onChange={handleChange}
                                                type="text"
                                                name="suburb"
                                                id="suburb"
                                                autoComplete="address-level2"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                            <label htmlFor="postalcode" className="block text-sm font-medium text-gray-700">
                                                Postcode
                                            </label>
                                            <input
                                                title="Please enter a valid postcode."
                                                value={values.postcode}
                                                onChange={handleChange}
                                                type="text"
                                                name="postcode"
                                                id="postcode"
                                                autoComplete="postal-code"
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Turnstile
                                    ref={ref}
                                    options={{ theme: 'light', responseFieldName: 'turnstileRes' }}
                                    siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                    onSuccess={(token) => handleChange({ target: { name: 'turnstileRes', value: token, type: 'text' } })}
                                />

                                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {loading ? 'Loading...' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </form>
                        <button onClick={() => alert(ref.current?.getResponse())}>
                            Get response
                        </button>
                        <SuccessPop success={success} setSuccess={setSuccess} />

                        <ErrorPop error={error} setError={setError} />
                    </>)}
            </Formik>
        </>
    )
}
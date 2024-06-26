"use client";

import Cookies from "js-cookie";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode, useEffect } from "react";
import { fullTokenVerification, clientSideTokenCheck } from "./lib/authFunctions";
import Spinner from "./components/spinner/Spinner";
import Message from "./components/message/Message";
import Nav from "./components/nav/Nav";

export default function Session({
    children,
}: {
    children: React.ReactNode
}) {
    const token = Cookies.get('token');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [message, setMessage] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [body, setBody] = useState<ReactNode | JSX.Element>(<Spinner />);

    useEffect(() => {
        setMessage('');

        // index page
        if (pathname == '/') {
            fullTokenVerification(token, pathname)
                .then((validity: boolean) => {
                    setIsValid(validity);

                    if (!validity) {
                        router.push('/login' + '?loginRequired=true');

                    } else {
                        setBody(children);

                        // user was redirected to index page after successful login attempt
                        if (searchParams.get('loginSuccessful') == 'true') {
                            setMessage('Login successful!');
                        };

                        // authenticated user attmpted to navigate to the login page
                        if (searchParams.get('haveToken') == 'true') {
                            setMessage('You are already logged in.');
                        };

                        // authenticated user requested a resource that does not exist
                        if (searchParams.get('404') == 'true') {
                            setMessage('Page not found');
                        };
                    };
            });
        }
            
            
        // login page
        else if (pathname == '/login') {
            // user was redirected to login page after logging out
            if (searchParams.get('loggedOut') == 'true') {
                setIsValid(false);
                setMessage('You have been logged out.');
                setBody(children);
            }

            // user was redirected to login page after failing token validation
            else if (searchParams.get('loginRequired') == 'true') {
                setIsValid(false);
                setMessage('You must be logged in to see that page.');
                setBody(children);
            }
                
            // unathenticated user requested a resource that does not exist
            else if (searchParams.get('404') == 'true') {
                setIsValid(false);
                setMessage('Page not found.');
                setBody(children);
            }
            
            else {
                fullTokenVerification(token, pathname)
                    .then((validity: boolean) => {
                        setIsValid(validity);
                        if (validity) {
                            router.push('/' + '?haveToken=true');
                        } else {
                            setBody(children);
                        };
                    });
            };
        }
            
            
        // pages that only require initial client side token verification. upon initial request,
        // each of these pages verify the provided token with a server-side api call
        else if (
            pathname == '/users'
            || pathname == '/balances'
            || pathname == '/payments'
        ) {
            if (!clientSideTokenCheck(token)) {
                setIsValid(false);
                router.push('/login' + '?loginRequired=true');

            } else {
                setIsValid(true);
                setBody(children);
            };
        }


        // pages that require full initial token authentication, ie: pages 
        // that don't have server-side token verification upon initial request
        else if (
            pathname == '/profile'
            || pathname == '/dataEntry'
            || pathname == '/billing'
            || pathname == '/reporting'
            || pathname == '/rollData'
        ) {
            fullTokenVerification(token, pathname)
                .then((validity: boolean) => {
                    setIsValid(validity);

                    if (!validity) {
                        router.push('/login' + '?loginRequired=true');

                    } else {
                        setBody(children);
                    };
            });
        }


        // undefined endpoints
        else {
            if (!clientSideTokenCheck(token)) {
                setIsValid(false);
                router.replace('/login' +'?404=true');
            } else {
                setIsValid(true);
                router.replace('/' + '?404=true');
            };
        };

    }, [pathname]);

    return (<>
        <Message messageState={{ value: message, setValue: setMessage }} />
        <Nav validity={ isValid } />
        {
            !isValid && pathname !== '/login' ? <></> : body
        }
    </>)
};

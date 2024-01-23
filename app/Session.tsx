'use client';

import Cookies from "js-cookie";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode, useEffect } from "react";
import { fullTokenVerification, clientSideTokenCheck } from "./lib/verifyToken";
import Spinner from "./components/spinner/Spinner";
import Message from "./components/message/Message";

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
    const [body, setBody] = useState<ReactNode | JSX.Element>(<Spinner />);

    useEffect(() => {
        setMessage('');

        // index page
        if (pathname == '/') {
            fullTokenVerification(token, pathname)
                .then((validity: boolean) => {
                    if (!validity) {
                        router.push('/login' + '?loginRequired=true');

                    } else {
                        setBody(children);

                        // user was redirected to index page after successful login attempt
                        if (searchParams.get('loginSuccessful') == 'true') {
                            setMessage('You have been logged in.');
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
                setMessage('You have been logged out.');
                setBody(children);
            }

            // user was redirected to login page after failing token validation
            else if (searchParams.get('loginRequired') == 'true') {
                setMessage('You must be logged in to see that page.');
                setBody(children);
            }
                
            // user failed a login attempt
            else if (searchParams.get('loginFalied') == 'true') {
                setMessage('Login failed.');
                setBody(children);
            }

            // unathenticated user requested a resource that does not exist
            else if (searchParams.get('404') == 'true') {
                setMessage('Page not found.');
                setBody(children);
            }
            
            else {
                fullTokenVerification(token, pathname)
                    .then((validity: boolean) => {
                        if (validity) {
                            router.push('/' + '?haveToken=true');
                        } else {
                            setBody(children);
                        };
                    });
            };
        }
            
            
        // users page
        else if (pathname == '/users') {
            // verify token on client side only. the associataed
            // server side api route will verify the token afterwards
            if (!clientSideTokenCheck(token)) {
                router.push('/login' + '?loginRequired=true')
            } else {
                setBody(children);
            };
        }


        // // another page...
        // else if (pathname = ...) {
        //     ...
        // }


        // undefined endpoints
        else {
            if (!clientSideTokenCheck(token)) {
                router.replace('/login' +'?404=true');
            } else {
                router.replace('/' + '?404=true');
            };
        };

    }, [pathname]);

    return (<>
        <Message text={ message } />
        { body }
    </>)
};

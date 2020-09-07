import { useState, useEffect } from 'react';

const loadScript = (d: Document, s: string, id: string, jsSrc: string, cb: () => void) => {
    const element = d.getElementsByTagName(s)[0];
    const fjs = element;
    let js = element;
    js = (d.createElement(s) as HTMLScriptElement);
    js.id = id;
    (js as HTMLScriptElement).src = jsSrc;
    if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
    } else {
        d.head.appendChild(js);
    }
    (js as HTMLScriptElement).onload = cb
}

const removeScript = (d: Document, id: string) => {
    const element = d.getElementById(id)

    element?.parentNode?.removeChild(element);
}

export const useGapi = ({
    onFailure,
    clientId,
    hostedDomain,
    discoveryDocs,
    scope,
    signInOptions,
    apiKey,
}: {
    onFailure?: (error: any) => void,
    clientId: string,
    discoveryDocs?: string[],
    scope: string,
    hostedDomain?: string,
    apiKey: string,
    signInOptions?: gapi.auth2.SigninOptions,
}) => {

    const [user, setUser] = useState<gapi.auth2.GoogleUser | undefined>(undefined);

    const [isGapiLoaded, setIsGapiLoaded] = useState(false);

    function signIn() {
        const auth = gapi.auth2.getAuthInstance();

        auth.signIn({ ...signInOptions, scope }).then(
            res => {
                setUser(res);
            },
            err => onFailure && onFailure(err),
        );
    }

    useEffect(() => {
        loadScript(
            document,
            'script',
            'google-login',
            'https://apis.google.com/js/api.js',
            () => {
                const params = {
                    client_id: clientId,
                    hosted_domain: hostedDomain,
                    discoveryDocs,
                    scope,
                    apiKey,
                };

                gapi.load('client:auth2', () => {
                    gapi.client.init(params).then(
                        () => {
                            const auth = gapi.auth2.getAuthInstance();
                            const isSignedIn = auth.isSignedIn.get();
                            if (isSignedIn) {
                                setUser({ ...auth.currentUser.get() });
                                setIsGapiLoaded(true);
                            } else {
                                setIsGapiLoaded(true);
                            }

                            auth.isSignedIn.listen(isSignedIn => {
                                setUser(isSignedIn ? auth.currentUser.get() : undefined);
                            });
                        },
                        err => {
                            onFailure && onFailure(err);
                            setIsGapiLoaded(true);
                        }
                    );
                });
            });

        return () => {
            removeScript(document, 'google-login');
        };
    }, [loadScript, removeScript]);

    const signOut = () => {
        console.log({ signout: true });
        gapi.auth2.getAuthInstance().signOut();
    };

    return {
        user,
        signIn,
        signOut,
        isGapiLoaded,
    };
};

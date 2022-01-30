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

export const useGapi = () => {
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);

    useEffect(() => {
        loadScript(
            document,
            'script',
            'google-login',
            'https://apis.google.com/js/api.js',
            () => {
                setIsGapiLoaded(true);
            });

        return () => {
            removeScript(document, 'google-login');
        };
    }, [
        loadScript,
        removeScript,
    ]);

    return isGapiLoaded;
};

export const useGapiAuth = ({
    scope,
    signInOptions,
    clientId,
    hostedDomain,
    discoveryDocs,
    apiKey,
    onFailure,
}: {
    clientId: string,
    discoveryDocs?: string[],
    hostedDomain?: string,
    apiKey: string,
    scope: string,
    signInOptions?: gapi.auth2.SigninOptions,
    onFailure?: (error: any) => void,
}) => {
    const isGapiLoaded = useGapi();

    const [user, setUser] = useState<gapi.auth2.GoogleUser | undefined>(
            isGapiLoaded 
                ? gapi.auth2?.getAuthInstance()?.currentUser.get()
                : undefined
    );

    const [isInitialized, setIsInitialized] = useState(isGapiLoaded && !!gapi.auth2?.getAuthInstance());

    function signIn() {
        const auth = gapi.auth2.getAuthInstance();

        auth.signIn({ ...signInOptions, scope }).then(
            res => {
                setUser(res);
            },
            err => onFailure && onFailure(err),
        );
    }

    useEffect(
        () => {
             if (!isGapiLoaded || !clientId) {
                return;
            }

            gapi.load('client:auth2', () => {
                gapi.client.init(
                    {
                        client_id: clientId,
                        hosted_domain: hostedDomain,
                        discoveryDocs,
                        scope,
                        apiKey,
                    } as any
                ).then(
                    () => {
                        const auth = gapi.auth2.getAuthInstance();
                        const isSignedIn = auth.isSignedIn.get();
                        if (isSignedIn) {
                            setUser({ ...auth.currentUser.get() });
                        }
                        
                        auth.isSignedIn.listen(isSignedIn => {
                            setUser(isSignedIn ? auth.currentUser.get() : undefined);
                        });

                        setIsInitialized(true);
                    },
                    err => {
                        onFailure && onFailure(err);
                    }
                );
            });
        },
        [
            clientId,
            isGapiLoaded,
            hostedDomain,
        ],
    );

    const signOut = () => {
        gapi.auth2.getAuthInstance().signOut();
    };

    return {
        isInitialized,
        user,
        signIn,
        signOut,
    };
}


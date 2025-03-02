import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFirstTimeOpen() {
    const [firstTimeOpen, setFirstTimeOpen] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(true);

    React.useEffect(() => {
        async function checkFirstTimeOpen() {
            try {
                const hasOpened = await AsyncStorage.getItem('hasOpened');

                if (hasOpened === null) {
                    setFirstTimeOpen(true);
                    return true;
                }
                else {
                    setFirstTimeOpen(false);
                }
            }
            catch (e){
                console.error(e);
            }
            finally {
                setIsLoaded(false);
            }
        }
    
        checkFirstTimeOpen();
    }, []);
    
    return { firstTimeOpen, isLoaded };
    }
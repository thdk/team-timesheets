import React, { useState, HTMLProps, useEffect, useMemo } from 'react';
import { useCallback } from 'react';
import { TextField, TextFieldProps } from '@rmwc/textfield';
import { ComponentProps } from '@rmwc/types';
import { debounce } from 'throttle-debounce';

type DebouncedTextfieldProps = {
    onChange: (query: string | undefined) => void,
    debounceDelay?: number,
};

type Props = Omit<ComponentProps<TextFieldProps, HTMLProps<HTMLInputElement>, "input">, "onChange">
    & DebouncedTextfieldProps;

const DebouncedTextfield = (props: Props) => {
    const {
        value = "",
        debounceDelay = 250,
        onKeyDown,
        onChange,
        ...restProps
    } = props;

    const [query, setQuery] = useState<string | undefined>(value.toString());

    const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }, []);

    const throttler = useMemo(() => debounce(debounceDelay, onChange), [onChange]);

    useEffect(() => {
        throttler(query);
    }, [query]);

    const handleQueryKeydown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.currentTarget.select();
            throttler(query);
            onKeyDown && onKeyDown(event);
        };
    }, []);

    return <TextField
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleQueryKeydown}
        {...restProps}
    />
};

export default DebouncedTextfield;
import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { CollectionSelect, ICollectionSelectItem } from './';

// Test data
const testItems = [
    {
        value: "1",
        label: "foo",
    },
    {
        value: "2",
        label: "bar",
    },
];

// Tests
const Test = ({
    items,
    onChange,
    value,
}: {
    items: ICollectionSelectItem[],
    onChange?: typeof jest.fn,
    value?: string,
}) => {
    const handleOnChange = onChange || jest.fn();

    return <CollectionSelect
        items={items}
        label="collection label"
        onChange={handleOnChange}
        value={value}
        id="test-collection"
    />
};

it("should render without items", () => {
    const { asFragment } = render(
        <Test items={[]} />
    );

    expect(asFragment()).toMatchSnapshot();
});

it("should render with items", () => {
    const { asFragment } = render(
        <Test items={testItems} />
    );

    expect(asFragment()).toMatchSnapshot();
});

it("should show pre selected option", () => {
    const { container } = render(
        <Test items={testItems} value="2" />
    );

    expect(container.querySelector(".mdc-select__selected-text")!.innerHTML)
        .toEqual("bar");
});

it("should call onChange when item is selected", (done) => {
    const onChange = jest.fn();

    const { container } = render(
        <Test items={testItems} onChange={onChange} />
    );
    const selectEl = container.querySelector<HTMLSelectElement>("#test-collection");

    window.requestAnimationFrame(() => {
        fireEvent.change(selectEl!);
        expect(onChange).toHaveBeenCalledTimes(1);
        done();
    });
});
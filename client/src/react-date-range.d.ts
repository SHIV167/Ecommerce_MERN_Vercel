// Declaration file for react-date-range to suppress implicit any errors
declare module 'react-date-range' {
    import { ComponentType } from 'react';
    export interface Range {
        startDate: Date;
        endDate: Date;
        key: string;
    }
    export const DateRange: ComponentType<{
        ranges: Range[];
        editableDateInputs?: boolean;
        onChange: (ranges: { selection: Range }) => void;
        moveRangeOnFirstSelection?: boolean;
    }>;
}

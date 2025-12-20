import type { FilterType } from './FilterType';

export interface Filter {
    type: FilterType;
    value: string;
    label: string;
    displayValue?: string;
    icon?: string;
    logo?: string | null;
}
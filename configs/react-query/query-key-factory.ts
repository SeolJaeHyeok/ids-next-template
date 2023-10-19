// react query key를 관리하는 factory 함수
export const exampleKeys = {
    all: ['articles'] as const,
    lists: () => [...exampleKeys.all, 'get_all_articles'] as const,
    list: (filters: any) => [...exampleKeys.lists(), { filters }] as const,
};

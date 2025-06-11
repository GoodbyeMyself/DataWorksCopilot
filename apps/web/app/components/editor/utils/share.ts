// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/share.ts

export const localStore = {
    get code(): string {
        return localStorage.getItem("code") || "";
    },
    set code(code: string) {
        localStorage.setItem("code", code);
    },
};

export function shareURL(code: string): string {
    const encoded = encodeURIComponent(code);
    return `${window.location.origin}${window.location.pathname}?code=${encoded}`;
}

export function shareMarkdown(code: string): string {
    const url = shareURL(code);
    return `[在线查看](${url})`;
}

export function reportIssue(code: string): string {
    const title = encodeURIComponent("SQL Editor Issue");
    const body = encodeURIComponent(`\`\`\`sql\n${code}\n\`\`\``);
    return `https://github.com/your-repo/issues/new?title=${title}&body=${body}`;
}

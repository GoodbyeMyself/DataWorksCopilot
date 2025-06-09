import { Terminal } from "lucide-react";
import { Suspense } from "react";

export default function NavBar(props: { children: React.ReactNode }) {
    return (
        <div className="flex h-16 max-h-16 min-h-16 w-full shrink-0 items-center border-b bg-background px-2">
            <div className="flex h-full items-center justify-evenly gap-3">
                <HomeIcon />
                <h1 className="ml-1 w-[200px] text-xl font-semibold">
                    DataWorks Copilot
                </h1>
                <Terminal
                    name="terminal"
                    className="size-5"
                />
            </div>
            <div className="ml-auto flex w-full items-center justify-end space-x-2 pr-2">
                <div className="ml-auto flex w-full items-center justify-end space-x-2">
                    <Suspense>{props.children}</Suspense>
                </div>
            </div>
        </div>
    );
}

function HomeIcon() {
    return <></>;
}

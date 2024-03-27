export default function Spinner() {
    return (<>
        <div className="h-screen w-full flex">
            <div
                className="m-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
            ></div>
        </div>
    </>)
}
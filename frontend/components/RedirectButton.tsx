import {useRouter} from 'next/router';

const RedirectButton = ({ to, children }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(to);
    };

    let className = "btn btn-primary gap-2 m-1";

    return <button className={className} onClick={handleClick}>{children}</button>;
};

export default RedirectButton;

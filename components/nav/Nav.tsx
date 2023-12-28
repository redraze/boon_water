import css from "styles/nav/Nav.module.scss";

export default function Nav() {
    return (<>
        <div
            className={ css.nav }
        >
            <ul>
                <li> 
                    <span>Data Entry</span>
                </li>
                <li> 
                    <span>Users</span>
                </li>
                <li>
                    <span>Login/Logout</span>
                </li>
            </ul>
        </div>
    </>);
};

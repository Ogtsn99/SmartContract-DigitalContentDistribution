import React, { FC, useContext } from 'react';
import { CurrentAddressContext } from "../hardhat/SymfoniContext";

export const Navbar = () => {
	const address = useContext(CurrentAddressContext)
	
	return (
		<nav className="navbar navbar-dark bg-dark navbar-expand-lg navbar-light bg-light">
			<a href="/"><h1 className="navbar-brand">P2P File Sharing</h1></a>
			
			<div className="collapse navbar-collapse" id="navbarSupportedContent">
				<ul className="navbar-nav mr-auto">
					<li className="nav-item active">
						<a className="nav-link" href="/">Home <span className="sr-only">(current)</span></a>
					</li>
					<li className="nav-item active">
						<a className="nav-link" href="/contentAndToken">ContentAndToken</a>
					</li>
					<li className="nav-item active">
						<a className="nav-link" href="/fileSharingContract">fileSharingContract</a>
					</li>
				</ul>
				<span className="navbar-text">
					{address}
		    </span>
			</div>
			
		</nav>
	)
}
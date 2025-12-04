import { Link } from "@tanstack/react-router";
import {
	ChevronDown,
	ChevronRight,
	Database,
	Home,
	Menu,
	Network,
	SquareFunction,
	StickyNote,
	X,
} from "lucide-react";

export default function Header() {
	return (
		<header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
			<h1 className="ml-4 text-xl font-semibold">
				<Link
					to="/"
					className="flex items-center gap-2 text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-xl"
					aria-label="Pikura home – Japanese photo booth"
				>
					<div
						className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/80 shadow"
						aria-hidden="true"
					>
						<span className="text-xs font-bold text-white">ピ</span>
					</div>
					<div className="flex flex-col leading-none">
						<span className="font-semibold">Pikura</span>
						<span className="text-[10px] text-slate-400">
							Japanese Photo Booth
						</span>
					</div>
				</Link>
			</h1>
		</header>
	);
}

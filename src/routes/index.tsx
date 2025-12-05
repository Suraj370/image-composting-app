import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="flex flex-col min-h-[calc(100vh-4rem)] bg-pink-100 text-gray-900">
			<main className="flex-1 flex flex-col items-center justify-center text-center px-4">
				{/* Subtitle */}
				<p className="text-sm font-medium text-pink-600 mb-2">
					Japanese Photo Booth Magic 🎀
				</p>

				{/* Main Title */}
				<h1
					className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-3xl"
					style={{
						textShadow: "0 2px 6px rgba(255, 105, 180, 0.4)",
					}}
				>
					Create adorable
					<span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
						{" "}
						Purikura photos{" "}
					</span>
					that sparkle ✨
				</h1>

				{/* Description */}
				<p
					className="mt-4 max-w-xl text-base text-gray-700 leading-relaxed"
					style={{
						textShadow: "0 1px 3px rgba(255, 255, 255, 0.7)",
					}}
				>
					Snap selfies, decorate with cute stickers, kawaii filters, and fun
					text
				</p>

				{/* Buttons */}
				<div className="mt-8 flex flex-col sm:flex-row gap-4">
					<Link
						to="/editor"
						className="px-7 py-3 rounded-full text-sm font-semibold
        bg-gradient-to-r from-pink-500 to-purple-500 
        text-white shadow-lg shadow-pink-300/50
        hover:opacity-90 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
					>
						Launch the Photo Booth 💖
					</Link>
				</div>

				{/* Supporting text */}
				<p className="mt-3 text-xs text-gray-600">
					Works in any browser — no app needed 🌐
				</p>
			</main>
		</div>
	);
}

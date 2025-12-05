// routes/editor/index.tsx
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { StripRemoveButton, ThemeOption } from "@/components/pikura-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePikuraEditor } from "@/hooks/usePikuraeditor";
import { cn } from "@/lib/utils";
import { generatePikura } from "@/server/pikura";
import {
	type EditorFormValues,
	MAX_FRAMES,
	STICKER_GALLERY,
	STRIP_THEME_STYLES,
} from "@/types/pikura";

export const Route = createFileRoute("/editor/")({
	component: EditorPage,
});

function EditorPage() {
	const {
		previewUrls,
		setPreviewUrls,
		activeFrame,
		setActiveFrame,
		stickers,
		setStickers,
		selectedEmoji,
		setSelectedEmoji,
		finalStripUrl,
		setFinalStripUrl,
		theme,
		setTheme,
		currentImageUrl,
		stickersForActiveFrame,
		handleAddStickerAt,
		removeSticker,
		handleDownload,
	} = usePikuraEditor();

	const fileInputId = React.useId();

	const form = useForm({
		defaultValues: {
			frames: [] as File[],
			theme: "pastel" as const,
		},
		onSubmit: async ({ value }: { value: EditorFormValues }) => {
			if (!value.frames.length) return;

			const formData = new FormData();
			for (const file of value.frames) {
				formData.append("frames", file);
			}
			formData.append("stickers", JSON.stringify(stickers));
			formData.append("theme", theme);

			try {
				const result = await generatePikura({ data: formData });

				if (!result?.imageUrl) {
					console.error("No imageUrl returned from server function");
					return;
				}

				setFinalStripUrl(result.imageUrl);
			} catch (err) {
				console.error("generatePikura failed", err);
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
			<Card className="w-full max-w-6xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold">
						Pikura Editor – Single Strip
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-8">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.3fr)]"
					>
						{/* LEFT COLUMN: Controls */}
						<div className="space-y-6">
							<form.Field
								name="frames"
								validators={{
									onChange: ({ value }) => {
										if (!value || value.length === 0)
											return "Add at least one photo";
										if (value.length > MAX_FRAMES)
											return `Max ${MAX_FRAMES} photos per strip`;
										return undefined;
									},
								}}
							>
								{(field) => {
									const meta = field.state.meta;

									return (
										<>
											<div className="space-y-2">
												<Label htmlFor={fileInputId}>Strip photos</Label>
												<Input
													id={fileInputId}
													type="file"
													accept="image/*"
													multiple
													onBlur={field.handleBlur}
													onChange={(event) => {
														const incoming = Array.from(
															event.target.files ?? [],
														);
														if (!incoming.length) return;

														const current = field.state.value ?? [];
														const remaining = MAX_FRAMES - current.length;
														const sliced = incoming.slice(0, remaining);
														const merged = [...current, ...sliced];

														field.handleChange(merged);
														event.target.value = "";

														setPreviewUrls((prev) => {
															prev.forEach((url) => {
																URL.revokeObjectURL(url);
															});
															return merged.map((file) =>
																URL.createObjectURL(file),
															);
														});

														if (activeFrame >= merged.length) {
															setActiveFrame(merged.length - 1);
														}
													}}
												/>
												<p className="text-xs text-muted-foreground">
													Add up to {MAX_FRAMES} photos. Each one is a frame in
													this strip.
												</p>
												{meta.isTouched && meta.errors?.length ? (
													<p className="text-sm text-destructive">
														{meta.errors.join(", ")}
													</p>
												) : null}
											</div>

											{field.state.value?.length ? (
												<div className="flex flex-wrap gap-2 pt-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => {
															field.handleChange([]);
															setPreviewUrls((prev) => {
																prev.forEach((url) => {
																	URL.revokeObjectURL(url);
																});
																return [];
															});
															setStickers([]);
															setActiveFrame(0);
														}}
													>
														Clear strip
													</Button>
												</div>
											) : null}

											{/* Sticker Gallery */}
											<div className="space-y-2 pt-4">
												<Label>Sticker gallery</Label>
												<ScrollArea className="h-28 rounded-md border bg-muted/40 p-2">
													<div className="flex flex-wrap gap-2">
														{STICKER_GALLERY.map((emoji) => (
															<button
																key={emoji}
																type="button"
																onClick={() => setSelectedEmoji(emoji)}
																className={cn(
																	"flex h-9 w-9 items-center justify-center rounded-full border text-xl transition",
																	emoji === selectedEmoji
																		? "border-pink-500 bg-pink-100 shadow-sm"
																		: "border-transparent bg-background hover:bg-accent",
																)}
															>
																{emoji}
															</button>
														))}
													</div>
												</ScrollArea>
												<p className="text-xs text-muted-foreground">
													Choose a sticker, select a frame, then click the
													preview to place it.
												</p>
											</div>

											{/* Theme Selector */}
											<form.Field name="theme">
												{(field) => (
													<div className="space-y-2 pt-4">
														<Label>Strip theme</Label>
														<RadioGroup
															value={field.state.value}
															onValueChange={(val) => {
																const t = val as typeof field.state.value;
																field.handleChange(t);
																setTheme(t);
															}}
															className="flex flex-wrap gap-2"
														>
															<ThemeOption
																value="plain"
																label="Plain"
																description="Clean white photobooth"
															/>
															<ThemeOption
																value="pastel"
																label="Pastel"
																description="Soft kawaii gradient"
															/>
															<ThemeOption
																value="midnight"
																label="Midnight"
																description="Dark neon glow"
															/>
														</RadioGroup>
													</div>
												)}
											</form.Field>

											{/* Submit Buttons */}
											<form.Subscribe
												selector={(state) =>
													[state.canSubmit, state.isSubmitting] as const
												}
											>
												{([canSubmit, isSubmitting]) => (
													<div className="flex flex-col space-y-2 pt-4">
														<Button
															type="submit"
															disabled={!canSubmit || isSubmitting}
														>
															{isSubmitting
																? "Generating…"
																: "Generate Pikura strip"}
														</Button>
														<Button
															type="button"
															disabled={!finalStripUrl}
															onClick={handleDownload}
														>
															Download
														</Button>
													</div>
												)}
											</form.Subscribe>
										</>
									);
								}}
							</form.Field>
						</div>

						{/* MIDDLE COLUMN: Strip Preview */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium text-foreground">
									Strip preview
								</Label>
								<span className="text-xs text-muted-foreground">
									{previewUrls.length}/{MAX_FRAMES} photos
								</span>
							</div>

							<div className="rounded-3xl border bg-muted/60 p-4">
								<div className="mx-auto w-44 sm:w-52">
									{(() => {
										const t = STRIP_THEME_STYLES[theme];

										return (
											<div
												className={cn(
													"shadow-lg ring-1 transition-colors",
													t.outer,
												)}
											>
												<div className={cn("flex flex-col gap-2 p-2", t.inner)}>
													{Array.from({ length: MAX_FRAMES }).map(
														(_, index) => {
															const url = previewUrls[index] ?? null;
															const frameStickers = stickers.filter(
																(s) => s.frameIndex === index,
															);

															return (
																<button
																	key={`frame-${index}`}
																	type="button"
																	onClick={() => {
																		if (url) setActiveFrame(index);
																	}}
																	className={cn(
																		"relative overflow-hidden border transition",
																		t.frame,
																		index === activeFrame && url
																			? "border-pink-400 ring-2 ring-pink-400/60"
																			: "border-slate-200/70 hover:border-slate-300",
																	)}
																>
																	<div className="relative w-full overflow-hidden">
																		{url ? (
																			<>
																				<img
																					src={url}
																					alt={`Frame ${index + 1}`}
																					className="block h-auto w-full"
																				/>
																				{frameStickers.map((sticker) => (
																					<span
																						key={sticker.id}
																						className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-lg drop-shadow"
																						style={{
																							left: `${sticker.xPct}%`,
																							top: `${sticker.yPct}%`,
																						}}
																					>
																						{sticker.emoji}
																					</span>
																				))}
																			</>
																		) : (
																			<div className="flex aspect-3/4 items-center justify-center text-[10px] font-medium text-slate-400">
																				Empty frame
																			</div>
																		)}
																	</div>

																	<div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[9px] font-medium text-white">
																		<span>{index + 1}</span>
																		<span className="opacity-80">
																			({frameStickers.length})
																		</span>
																	</div>

																	{url && (
																		<StripRemoveButton
																			index={index}
																			onRemove={() => {
																				const values =
																					(form.getFieldValue("frames") as
																						| File[]
																						| undefined) ?? [];
																				const next = values.filter(
																					(_, i) => i !== index,
																				);
																				form.setFieldValue("frames", next);

																				setPreviewUrls((prev) => {
																					const copy = [...prev];
																					const [removed] = copy.splice(
																						index,
																						1,
																					);
																					if (removed)
																						URL.revokeObjectURL(removed);
																					return copy;
																				});
																			}}
																		/>
																	)}
																</button>
															);
														},
													)}
												</div>
											</div>
										);
									})()}
								</div>

								{!previewUrls.length && (
									<p className="mt-3 text-center text-xs text-muted-foreground">
										Upload photos on the left. Each becomes a frame in this
										themed strip.
									</p>
								)}
							</div>
						</div>

						{/* RIGHT COLUMN: Big Editable Preview */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium text-foreground">
									Edit frame {activeFrame + 1}
								</Label>
							</div>

							<div
								className={cn(
									"rounded-3xl border bg-muted/60 p-4",
									theme === "midnight" && "border-slate-700 bg-slate-900/70",
								)}
							>
								<div
									className={cn(
										"relative mx-auto flex max-h-[420px] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl bg-slate-200",
										currentImageUrl ? "cursor-crosshair" : "cursor-not-allowed",
										theme === "pastel" &&
											"bg-linear-to-br from-pink-50 via-slate-100 to-sky-50",
										theme === "midnight" &&
											"bg-linear-to-br from-slate-900 via-slate-800 to-indigo-900",
									)}
									onClick={currentImageUrl ? handleAddStickerAt : undefined}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleAddStickerAt(e as any);
										}
									}}
									role="button"
									tabIndex={0}
								>
									{currentImageUrl ? (
										<>
											<img
												src={currentImageUrl}
												alt="Current frame"
												className="max-h-full max-w-full object-contain"
											/>
											{stickersForActiveFrame.map((sticker) => (
												<button
													key={sticker.id}
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														removeSticker(sticker.id);
													}}
													className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl drop-shadow"
													style={{
														left: `${sticker.xPct}%`,
														top: `${sticker.yPct}%`,
													}}
													title="Click to remove sticker"
												>
													{sticker.emoji}
												</button>
											))}
										</>
									) : (
										<p className="text-xs text-muted-foreground">
											Select a frame with an image from the strip to edit it.
										</p>
									)}
								</div>

								<div className="mt-3 space-y-1">
									<p className="text-xs font-medium text-muted-foreground">
										Stickers on this frame
									</p>
									{stickersForActiveFrame.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											None yet. Choose a sticker and click on the image to add
											it.
										</p>
									) : (
										<div className="flex flex-wrap gap-1">
											{stickersForActiveFrame.map((sticker) => (
												<Button
													key={sticker.id}
													type="button"
													size="sm"
													variant="outline"
													onClick={() => removeSticker(sticker.id)}
													className="h-6 gap-1 rounded-full px-2 text-[11px]"
												>
													<span>{sticker.emoji}</span>
													<span className="text-[9px] text-muted-foreground">
														{activeFrame + 1}
													</span>
													<span className="text-xs leading-none">×</span>
												</Button>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

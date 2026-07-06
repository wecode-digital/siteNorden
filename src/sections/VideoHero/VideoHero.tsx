"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { LocalizedText } from "@/i18n/text";
import styles from "./VideoHero.module.scss";

// Props recebidas do Headless CMS (cms/faststore/sections.json → "VideoHero").
export interface VideoHeroProps {
  videoDesktop?: string;
  videoMobile?: string;
  poster?: string;
  alt?: LocalizedText;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

const VIMEO_RE = /player\.vimeo\.com\/video\/(\d+)/;

interface MediaOpts {
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

/** Monta o src de embed do Vimeo (modo background: autoplay/loop/muted, sem controles). */
function vimeoEmbedSrc(videoId: string, { autoplay, loop, muted }: MediaOpts): string {
  const params = new URLSearchParams({
    background: "1",
    autoplay: autoplay ? "1" : "0",
    loop: loop ? "1" : "0",
    muted: muted ? "1" : "0",
  });
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

/**
 * Renderiza a mídia: URL do player do Vimeo vira <iframe> de embed; qualquer
 * outra URL é tratada como arquivo de vídeo direto (mp4/webm) via <video>.
 * `onReady` dispara quando a mídia carrega; `onFail` quando falha ao carregar.
 */
function HeroMedia({
  url,
  className,
  alt,
  autoplay,
  loop,
  muted,
  onReady,
  onFail,
}: MediaOpts & {
  url: string;
  className: string;
  alt?: string;
  onReady: () => void;
  onFail: () => void;
}) {
  const vimeo = url.match(VIMEO_RE);

  if (vimeo) {
    return (
      <iframe
        className={className}
        src={vimeoEmbedSrc(vimeo[1], { autoplay, loop, muted })}
        title={alt || "Vídeo"}
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={onReady}
        onError={onFail}
      />
    );
  }

  return (
    <video
      className={className}
      src={url}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      playsInline
      preload="auto"
      aria-label={alt || undefined}
      onLoadedData={onReady}
      onError={onFail}
    />
  );
}

const VideoHero = ({
  videoDesktop,
  videoMobile,
  poster,
  alt,
  autoplay = true,
  loop = true,
  muted = true,
}: VideoHeroProps) => {
  const [mediaReady, setMediaReady] = useState(false);
  const { t } = useLocale();

  // Sem nenhuma mídia cadastrada, não renderiza nada (convenção: campos não-obrigatórios).
  if (!videoDesktop && !videoMobile && !poster) return null;

  const altText = t(alt);
  const mediaOpts: MediaOpts = { autoplay, loop, muted };
  const desktopUrl = videoDesktop || videoMobile;
  const hasMobile = Boolean(videoMobile);
  const hasVideo = Boolean(desktopUrl);

  // Poster (fallback) só aparece enquanto o vídeo não carregou ou se não houver vídeo.
  const showPoster = Boolean(poster) && (!hasVideo || !mediaReady);

  return (
    <section
      className={styles.videoHero}
      //style={showPoster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      {desktopUrl && (
        <HeroMedia
          url={desktopUrl}
          className={`${styles.media} ${hasMobile ? styles.desktopOnly : ""}`}
          alt={altText}
          onReady={() => setMediaReady(true)}
          onFail={() => setMediaReady(false)}
          {...mediaOpts}
        />
      )}

      {hasMobile && (
        <HeroMedia
          url={videoMobile as string}
          className={`${styles.media} ${styles.mobileOnly}`}
          alt={altText}
          onReady={() => setMediaReady(true)}
          onFail={() => setMediaReady(false)}
          {...mediaOpts}
        />
      )}
    </section>
  );
};

export default VideoHero;

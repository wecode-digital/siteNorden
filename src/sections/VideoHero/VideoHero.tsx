"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "@/i18n/text";
import styles from "./VideoHero.module.scss";

// Props recebidas do Headless CMS (cms/faststore/sections.json → "VideoHero").
// Vídeo por idioma: campos separados (não LocalizedText) — casam com o widget
// de media-gallery do CMS. "Inglês"/"Espanhol" vazios caem no campo base (PT).
export interface VideoHeroProps {
  videoDesktop?: string;
  videoDesktopEnglish?: string;
  videoDesktopEspanhol?: string;
  videoMobile?: string;
  videoMobileEnglish?: string;
  videoMobileEspanhol?: string;
  poster?: string;
  alt?: LocalizedText;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

/** Vídeo do idioma atual; sem cadastro em EN/ES, cai no campo base (PT). */
function pickByLocale(locale: Locale, base?: string, english?: string, spanish?: string): string | undefined {
  if (locale === "en") return english || base;
  if (locale === "es") return spanish || base;
  return base;
}

// Aceita tanto o link de compartilhamento (vimeo.com/ID) quanto o de embed
// (player.vimeo.com/video/ID) — em ambos os casos extrai só o ID numérico.
const VIMEO_RE = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;

// O widget de media-gallery do CMS aceita tanto vídeo quanto imagem — detecta
// pela extensão do arquivo para decidir entre <img> e <video>.
const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;

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

  if (IMAGE_RE.test(url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={className}
        src={url}
        alt={alt || ""}
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
  videoDesktopEnglish,
  videoDesktopEspanhol,
  videoMobile,
  videoMobileEnglish,
  videoMobileEspanhol,
  poster,
  alt,
  autoplay = true,
  loop = true,
  muted = true,
}: VideoHeroProps) => {
  const [mediaReady, setMediaReady] = useState(false);
  const { t, locale } = useLocale();

  const desktopUrl = pickByLocale(locale, videoDesktop, videoDesktopEnglish, videoDesktopEspanhol);
  const mobileUrl = pickByLocale(locale, videoMobile, videoMobileEnglish, videoMobileEspanhol);

  // Sem nenhuma mídia cadastrada, não renderiza nada (convenção: campos não-obrigatórios).
  if (!desktopUrl && !mobileUrl && !poster) return null;

  const altText = t(alt);
  const mediaOpts: MediaOpts = { autoplay, loop, muted };
  const resolvedDesktopUrl = desktopUrl || mobileUrl;
  const hasMobile = Boolean(mobileUrl);
  const hasVideo = Boolean(resolvedDesktopUrl);

  // Poster (fallback) só aparece enquanto o vídeo não carregou ou se não houver vídeo.
  const showPoster = Boolean(poster) && (!hasVideo || !mediaReady);

  return (
    <section
      className={styles.videoHero}
      //style={showPoster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      {resolvedDesktopUrl && (
        <HeroMedia
          url={resolvedDesktopUrl}
          className={`${styles.media} ${hasMobile ? styles.desktopOnly : ""}`}
          alt={altText}
          onReady={() => setMediaReady(true)}
          onFail={() => setMediaReady(false)}
          {...mediaOpts}
        />
      )}

      {hasMobile && (
        <HeroMedia
          url={mobileUrl as string}
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

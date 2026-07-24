"use client";

import { useState, type FormEvent } from "react";
import { draftToHtml } from "@/lib/draftToHtml";
import { rethinkSans } from "@/lib/fonts";
import styles from "./JobsList.module.scss";
import type { JobContent, JobsListProps } from "./types";

type Filter = "open" | "all";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Campo de currículo: parece um input de texto (como o resto do form), mas é um `<input type="file">` disfarçado. */
function ResumeField() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <label className={styles.fileField}>
      <span className={styles.fileLabel}>
        {fileName ?? (
          <>
            Anexe seu currículo <span className={styles.fileLink}>aqui</span>
          </>
        )}
      </span>
      <input
        type="file"
        name="resume"
        accept=".pdf,.doc,.docx"
        className={styles.fileInput}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}

/** Formulário de candidatura — o título da vaga vai junto no envio, mas não aparece como campo visível. */
function ApplicationForm({ jobTitle }: { jobTitle?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (jobTitle) formData.set("job", jobTitle);

    try {
      const res = await fetch("/api/job-application", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string })?.message || "Erro ao enviar candidatura.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro ao enviar candidatura.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <p className={styles.successMessage}>
          Candidatura enviada! Em breve entraremos em contato.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      <p className={styles.formIntro}>Preencha o formulário abaixo e faça parte do nosso ecossistema:</p>
      <div className={styles.formFields}>
        <input className={styles.input} type="text" name="name" placeholder="Nome" required />
        <input className={styles.input} type="text" name="company" placeholder="Empresa" />
        <input className={styles.input} type="email" name="email" placeholder="E-mail" required />
        <input className={styles.input} type="tel" name="phone" placeholder="Telefone" />
        <ResumeField />
      </div>
      {status === "error" && <p className={styles.errorMessage}>{errorMessage}</p>}
      <button type="submit" className={styles.submitButton} disabled={status === "submitting"}>
        {status === "submitting" ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}

interface JobCardProps {
  job: JobContent;
  expanded: boolean;
  onToggle: () => void;
}

function JobCard({ job, expanded, onToggle }: JobCardProps) {
  // Todos os blocos extras desta vaga podem ficar abertos ao mesmo tempo,
  // cada um alternando de forma independente — cada vaga tem seu próprio
  // estado (useState por instância de JobCard), então isso não afeta as
  // outras vagas.
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());

  const toggleSection = (i: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const descriptionHtml = draftToHtml(job.description);
  const sections = job.sections ?? [];

  return (
    <div className={`${styles.card} ${expanded ? styles.expanded : ""}`}>
      <button
        type="button"
        className={styles.header}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className={`${styles.jobTitle} ${rethinkSans.className}`}>{job.title}</span>
        <ChevronIcon className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`} />
      </button>
      <span className={styles.divider} />

      {descriptionHtml && (
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      )}

      {sections.length > 0 && (
        <div className={styles.extraSections}>
          {sections.map((section, i) => {
            const contentHtml = draftToHtml(section.content);
            const sectionOpen = openSections.has(i);
            return (
              <div key={i} className={styles.extraSection}>
                {section.buttonLabel && (
                  <button
                    type="button"
                    className={styles.extraButton}
                    onClick={() => toggleSection(i)}
                    aria-expanded={sectionOpen}
                  >
                    {section.buttonLabel}
                    <ChevronIcon className={`${styles.chevron} ${sectionOpen ? styles.chevronOpen : ""}`} />
                  </button>
                )}
                {sectionOpen && contentHtml && (
                  <div className={styles.extraContent} dangerouslySetInnerHTML={{ __html: contentHtml }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!expanded && (
        <button type="button" className={styles.applyButton} onClick={onToggle}>
          Quero me candidatar
        </button>
      )}

      {expanded && <ApplicationForm jobTitle={job.title} />}
    </div>
  );
}

export function JobsList({ title, jobs = [] }: JobsListProps) {
  const [filter, setFilter] = useState<Filter>("open");
  // Só uma vaga com conteúdo aberto por vez (evita poluir a tela com vários
  // formulários/descrições abertos ao mesmo tempo) — guardado aqui, não em
  // cada card, senão cada vaga controlaria seu próprio "aberto" sem saber das
  // outras. Indexado pela posição em `jobs` (não em `filtered`), pra não
  // embaralhar ao trocar o filtro.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (jobs.length === 0) return null;

  const jobsWithIndex = jobs.map((job, originalIndex) => ({ job, originalIndex }));
  const filtered =
    filter === "open" ? jobsWithIndex.filter(({ job }) => job.open !== false) : jobsWithIndex;

  return (
    <section className={styles.jobsList}>
      <div className={styles.listHead}>
        {title && <h2 className={`${styles.title} ${rethinkSans.className}`}>{title}</h2>}
        <div className={styles.filterRow}>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === "open" ? styles.filterActive : ""}`}
            onClick={() => setFilter("open")}
          >
            Em aberto
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${filter === "all" ? styles.filterActive : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Nenhuma vaga encontrada no momento.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(({ job, originalIndex }) => (
            <JobCard
              key={originalIndex}
              job={job}
              expanded={expandedIndex === originalIndex}
              onToggle={() => setExpandedIndex((prev) => (prev === originalIndex ? null : originalIndex))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default JobsList;

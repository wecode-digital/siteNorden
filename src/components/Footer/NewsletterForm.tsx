"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import { useLocale } from "@/i18n/LocaleProvider";
import { rethinkSans } from "@/lib/fonts";
import { hasLocale, type LocalizedText } from "@/i18n/text";
import styles from "./Footer.module.scss";
import type { FooterFormData } from "./types";

const DEFAULTS = {
  title: { pt: "Contato", en: "Contact", es: "Contacto" },
  heading: {
    pt: "Preencha o formulário abaixo e faça parte do nosso ecossistema:",
    en: "Fill out the form below and join our ecosystem:",
    es: "Completa el formulario y forma parte de nuestro ecosistema:",
  },
  name: { pt: "Nome", en: "Name", es: "Nombre" },
  company: { pt: "Empresa", en: "Company", es: "Empresa" },
  email: { pt: "E-mail", en: "E-mail", es: "Correo electrónico" },
  phone: { pt: "Telefone", en: "Phone", es: "Teléfono" },
  message: { pt: "Mensagem", en: "Message", es: "Mensaje" },
  submit: { pt: "Enviar", en: "Send", es: "Enviar" },
};

const MESSAGE_MAX_LENGTH = 750;

const MESSAGES = {
  required: { pt: "*Preenchimento obrigatório", en: "*Required field", es: "*Campo obligatorio" },
  email: {
    pt: "*E-mail preenchido incorretamente",
    en: "*Invalid email",
    es: "*Correo inválido",
  },
  phone: {
    pt: "*Telefone preenchido incorretamente",
    en: "*Invalid phone",
    es: "*Teléfono inválido",
  },
  messageMax: {
    pt: `*Máximo de ${MESSAGE_MAX_LENGTH} caracteres`,
    en: `*Maximum ${MESSAGE_MAX_LENGTH} characters`,
    es: `*Máximo ${MESSAGE_MAX_LENGTH} caracteres`,
  },
  success: { pt: "Formulário enviado", en: "Form submitted", es: "Formulario enviado" },
  submitError: {
    pt: "Erro ao enviar. Tente novamente.",
    en: "Something went wrong. Please try again.",
    es: "Error al enviar. Inténtalo de nuevo.",
  },
};

// Regex prático de e-mail (não aceita caracteres como '#' no local part e exige
// TLD com letras) — alinhado ao validador do Master Data da VTEX.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Parte nacional: (DD) NNNN-NNNN (10 díg.) ou (DD) NNNNN-NNNN (11 díg.). */
function maskNational(digits: string): string {
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const splitAt = rest.length <= 8 ? 4 : 5;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

/**
 * Máscara de telefone com código de país opcional.
 * Até 11 dígitos → nacional `(DD) NNNNN-NNNN`. Acima disso, os dígitos
 * excedentes viram o DDI: `+55 (54) 99999-9999`.
 */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length === 0) return "";
  if (digits.length <= 11) return maskNational(digits);
  // Com DDI: os dígitos além dos 11 nacionais (celular) são o código de país.
  const cc = digits.slice(0, digits.length - 11);
  return `+${cc} ${maskNational(digits.slice(digits.length - 11))}`;
}

const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());
const isValidPhone = (v: string) => {
  // 10–11 díg. (nacional) ou 12–14 (DDI de 1–3 díg. + nacional).
  const len = v.replace(/\D/g, "").length;
  return len >= 10 && len <= 14;
};

type FieldName = "name" | "company" | "email" | "phone" | "message";
type Status = "idle" | "loading" | "success" | "error";
const EMPTY = { name: "", company: "", email: "", phone: "", message: "" };

/** Valida um campo e retorna a mensagem (LocalizedText) ou null se válido. */
function validateField(field: FieldName, value: string): LocalizedText | null {
  // "message" é opcional — só valida o limite de caracteres.
  if (field === "message") {
    return value.length > MESSAGE_MAX_LENGTH ? MESSAGES.messageMax : null;
  }
  if (!value.trim()) return MESSAGES.required;
  if (field === "email" && !isValidEmail(value)) return MESSAGES.email;
  if (field === "phone" && !isValidPhone(value)) return MESSAGES.phone;
  return null;
}

export function NewsletterForm({ form }: { form?: FooterFormData }) {
  const { t, locale } = useLocale();
  const [values, setValues] = useState(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  // Erros derivados: só aparecem após tentativa de envio.
  const errors: Record<FieldName, LocalizedText | null> = {
    name: attempted ? validateField("name", values.name) : null,
    company: attempted ? validateField("company", values.company) : null,
    email: attempted ? validateField("email", values.email) : null,
    phone: attempted ? validateField("phone", values.phone) : null,
    message: attempted ? validateField("message", values.message) : null,
  };

  const update = (field: FieldName, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (status !== "idle") setStatus("idle"); // limpa msg de sucesso/erro ao editar
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);

    const fields: FieldName[] = ["name", "company", "email", "phone", "message"];
    const hasError = fields.some((f) => validateField(f, values[f]) !== null);
    if (hasError) return; // barra o envio

    setStatus("loading");
    try {
      const res = await fetch("/api/form-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      setValues(EMPTY); // limpa os campos
      setAttempted(false);
    } catch {
      setStatus("error");
    }
  };

  const renderField = (
    field: FieldName,
    type: string,
    placeholder: LocalizedText,
    extra?: { inputMode?: "numeric"; mask?: boolean; textarea?: boolean; maxLength?: number }
  ) => {
    const cmsPlaceholder = form?.[`${field}Placeholder` as keyof FooterFormData] as
      | LocalizedText
      | undefined;
    const sharedProps = {
      name: field,
      placeholder: hasLocale(cmsPlaceholder, locale) ? t(cmsPlaceholder) : t(placeholder),
      value: values[field],
      "aria-invalid": Boolean(errors[field]),
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        update(field, extra?.mask ? maskPhone(e.currentTarget.value) : e.currentTarget.value),
    };

    return (
      <div className={styles.field}>
        {extra?.textarea ? (
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            maxLength={extra.maxLength}
            rows={4}
            {...sharedProps}
          />
        ) : (
          <input className={styles.input} type={type} inputMode={extra?.inputMode} {...sharedProps} />
        )}
        {errors[field] && <span className={styles.error}>{t(errors[field])}</span>}
      </div>
    );
  };

  return (
    <form id="contato" className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formIntro}>
        <AnimatedText
          as="h3"
          className={`${styles.formTitle} ${rethinkSans.className}`}
          value={hasLocale(form?.title, locale) ? form?.title : DEFAULTS.title}
        />
        <p className={styles.formHeading}>
          <AnimatedText value={hasLocale(form?.heading, locale) ? form?.heading : DEFAULTS.heading} />
        </p>
      </div>

      <div className={styles.fieldsWrapper}>
        <div className={styles.fields}>
          {renderField("name", "text", DEFAULTS.name)}
          {renderField("company", "text", DEFAULTS.company)}
          {renderField("email", "email", DEFAULTS.email)}
          {renderField("phone", "tel", DEFAULTS.phone, { inputMode: "numeric", mask: true })}
          {renderField("message", "text", DEFAULTS.message, {
            textarea: true,
            maxLength: MESSAGE_MAX_LENGTH,
          })}
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          <AnimatedText
            value={hasLocale(form?.submitLabel, locale) ? form?.submitLabel : DEFAULTS.submit}
          />
        </button>

        {status === "success" && <p className={styles.success}>{t(MESSAGES.success)}</p>}
        {status === "error" && <p className={styles.error}>{t(MESSAGES.submitError)}</p>}
      </div>
    </form>
  );
}

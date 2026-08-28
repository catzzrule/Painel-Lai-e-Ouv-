import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Atualiza o badge de período no header com o intervalo de meses.
 * @param meses Array de strings no formato "YYYY-MM"
 */
export function updatePeriodBadge(meses: string[]): void {
  if (meses.length === 0) return;
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const fmt = (m: string) => {
    const [ano, mes] = m.split("-");
    return nomes[parseInt(mes, 10) - 1] + "/" + ano.slice(2);
  };
  const badge = document.getElementById("badge-periodo");
  if (badge) badge.textContent = `${fmt(meses[0])} — ${fmt(meses[meses.length - 1])}`;
}

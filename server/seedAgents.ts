/**
 * Script de carga inicial (seed) de las 21 células agente de EDV,
 * según el diseño en EDV_Enterprise_Agents_Map.md.
 *
 * Uso: pnpm tsx server/seedAgents.ts
 */
import "dotenv/config";
import { getDb } from "./db";
import { agents } from "../drizzle/schema";

const AGENTS: Array<{ name: string; role: string; organ: string; description: string }> = [
  // Órgano I: Dirección y Coordinación Estratégica
  { name: "CEO-Agent", role: "Célula de Orquestación General", organ: "Dirección y Coordinación Estratégica", description: "Coordina las prioridades macro de la empresa, distribuye subtareas entre órganos, evalúa cuellos de botella y decide cuándo elevar una excepción crítica a la dirección humana." },
  { name: "DNA-Governor Agent", role: "Célula de Custodia Institucional", organ: "Dirección y Coordinación Estratégica", description: "Administra el ADN Organizacional, indexa nuevas normativas, valida que los procedimientos sigan las políticas internas y actualiza los embeddings de la memoria vectorial." },
  { name: "Audit & Compliance Agent", role: "Célula de Auditoría y Cumplimiento", organ: "Dirección y Coordinación Estratégica", description: "Revisa de forma cruzada cada transacción, detecta desvíos operativos, previene riesgos de fraude y asegura la trazabilidad inmutable." },

  // Órgano II: Área Impositiva y Fiscal
  { name: "VAT & Sales Tax Agent", role: "Célula de IVA y Tributos Indirectos", organ: "Área Impositiva y Fiscal", description: "Calcula débitos y créditos fiscales, procesa libros IVA compras/ventas y determina las posiciones mensuales." },
  { name: "Corporate Income Tax Agent", role: "Célula de Impuesto a las Ganancias", organ: "Área Impositiva y Fiscal", description: "Monitorea anticipos, calcula la renta neta imponible corporativa, deduce amortizaciones y proyecta la liquidación anual." },
  { name: "Withholding & Compliance Agent", role: "Célula de Retenciones y Percepciones", organ: "Área Impositiva y Fiscal", description: "Controla padrones de AFIP/ARCA y jurisdicciones locales, calculando retenciones en origen para pagos a proveedores y cobros a clientes." },
  { name: "Tax Data Intake Agent", role: "Célula de Ingesta Fiscal", organ: "Área Impositiva y Fiscal", description: "Recibe comprobantes, padrones y archivos de trabajo, normaliza los datos y valida su integridad antes de iniciar los cálculos tributarios." },

  // Órgano III: Área Contable y Financiera
  { name: "General Ledger Agent", role: "Célula de Contabilidad y Asientos", organ: "Área Contable y Financiera", description: "Registra automáticamente comprobantes, genera el libro diario y mayor, y clasifica transacciones según el plan de cuentas." },
  { name: "Accounts Receivable Agent", role: "Célula de Cobranzas y Cuentas Corrientes", organ: "Área Contable y Financiera", description: "Realiza el seguimiento de facturas emitidas, emite alertas de morosidad, concilia cobros de pasarelas y actualiza estados de cuenta." },
  { name: "Accounts Payable Agent", role: "Célula de Proveedores y Pagos", organ: "Área Contable y Financiera", description: "Valida facturas electrónicas de compras, coteja con órdenes de compra y programa los pagos según el flujo de caja disponible." },
  { name: "Treasury & Cash Flow Agent", role: "Célula de Tesorería y Caja", organ: "Área Contable y Financiera", description: "Proyecta la liquidez a 30, 60 y 90 días, administra conciliaciones bancarias diarias y optimiza excedentes financieros." },
  { name: "Financial Close & Controls Agent", role: "Célula de Cierre y Controles", organ: "Área Contable y Financiera", description: "Ejecuta checklists de cierre, verifica consistencia entre subdiarios y libro mayor, y eleva diferencias materiales a HITL." },

  // Órgano IV: Área de Capital Humano y Nómina
  { name: "Payroll Calculation Agent", role: "Célula de Liquidación de Haberes", organ: "Capital Humano y Nómina", description: "Calcula sueldos brutos, presentismo, antigüedad, horas suplementarias y deducciones de ley conforme a convenios colectivos." },
  { name: "Social Charges & F931 Agent", role: "Célula de Cargas Sociales y F.931", organ: "Capital Humano y Nómina", description: "Determina las contribuciones patronales a la seguridad social, obra social y sindicatos, generando la base para las declaraciones juradas mensuales." },
  { name: "Personnel Administration Agent", role: "Célula de Legajos y Novedades", organ: "Capital Humano y Nómina", description: "Administra altas tempranas, licencias, vacaciones, bajas y novedades de personal sincronizadas con el padrón de empleados." },

  // Órgano V: Área Comercial y Facturación
  { name: "Invoicing Agent", role: "Célula de Emisión de Facturación", organ: "Área Comercial y Facturación", description: "Conecta con los servicios de factura electrónica (AFIP/ARCA o APIs fiscales), emite comprobantes A, B o C y genera notas de crédito o débito." },
  { name: "Pricing & Fee Agent", role: "Célula de Tarifas y Contratos", organ: "Área Comercial y Facturación", description: "Monitorea acuerdos comerciales con clientes, actualiza honorarios o precios según fórmulas indexadas y genera los cargos periódicos." },

  // Órgano VI: Área de Operaciones y Abastecimiento
  { name: "Inventory & Stock Agent", role: "Célula de Inventario y Activos", organ: "Operaciones y Abastecimiento", description: "Controla ingresos y salidas de mercadería, calcula valuaciones de stock y detecta puntos de reorden." },
  { name: "Vendor Management Agent", role: "Célula de Evaluación de Proveedores", organ: "Operaciones y Abastecimiento", description: "Califica el cumplimiento, tiempos de entrega y competitividad de precios de los proveedores habituales." },

  // Órgano VII: Área Legal y Contractual
  { name: "Contract Intelligence Agent", role: "Célula de Análisis de Contratos", organ: "Área Legal y Contractual", description: "Revisa contratos comerciales, identifica cláusulas de riesgo, plazos de vencimiento y obligaciones de cumplimiento." },
  { name: "Regulatory Watch Agent", role: "Célula de Vigilancia Normativa", organ: "Área Legal y Contractual", description: "Analiza boletines oficiales y nuevas resoluciones fiscales o laborales para proponer actualizaciones automáticas al ADN Organizacional." },
];

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("No se pudo conectar a la base de datos. Verificá DATABASE_URL en tu .env.");
    process.exit(1);
  }

  const existing = await db.select().from(agents);
  const existingNames = new Set(existing.map(a => a.name));

  let created = 0;
  for (const agent of AGENTS) {
    if (existingNames.has(agent.name)) {
      console.log(`- Ya existe, se omite: ${agent.name}`);
      continue;
    }
    await db.insert(agents).values({
      name: agent.name,
      role: agent.role,
      organ: agent.organ,
      description: agent.description,
      status: "active",
      autonomyLevel: 1,
    });
    created++;
    console.log(`✓ Creado: ${agent.name} (${agent.organ})`);
  }

  console.log(`\nListo. ${created} agentes nuevos creados, ${existing.length} ya existían.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error al cargar los agentes:", err);
  process.exit(1);
});
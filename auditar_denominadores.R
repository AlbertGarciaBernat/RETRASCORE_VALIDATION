# Auditoria de solo lectura de los denominadores de mortalidad.
r <- readLines("clean_retrauci.Rmd", encoding = "UTF-8", warn = FALSE)
limite <- grep("^## Tables to study", r)[1]
stopifnot(!is.na(limite))
r <- r[seq_len(limite - 1)]
codigo <- character()
dentro <- FALSE
for (linea in r) {
  if (startsWith(linea, "```{r")) {
    dentro <- TRUE
    next
  }
  if (startsWith(linea, "```")) {
    dentro <- FALSE
    next
  }
  if (dentro) codigo <- c(codigo, linea)
}
View <- function(...) invisible(NULL)
invisible(eval(parse(text = codigo)))
stopifnot(length(candidatas_paper) == 20)
stopifnot(!anyNA(datos_derivacion[variables_regresion]))
stopifnot(!anyNA(datos_validacion[variables_regresion]))
stopifnot(all(datos_derivacion$anio_trauma %in% 2015:2017))
stopifnot(all(datos_validacion$anio_trauma %in% 2018:2019))
stopifnot(identical(tabla_1_derivacion$id_fila, datos_derivacion$id_fila))
stopifnot(identical(tabla_1_validacion$id_fila, datos_validacion$id_fila))
stopifnot(length(intersect(datos_derivacion$id_fila,
                          datos_validacion$id_fila)) == 0)
stopifnot(!any(grepl("tabla_caracteristicas_gcs", r, fixed = TRUE)))
print(flujo_cohorte_paper)
print(resumen_lasso)
print(predictores_regresion)
print(resumen_muestras_regresion)
print(tabla_rendimiento_modelo)
for (grupo in c("derivacion", "validacion")) {
  d <- if (grupo == "derivacion") tabla_1_derivacion else tabla_1_validacion
  completo <- complete.cases(d[variables_regresion])
  conocido <- !is.na(d$mortalidad_30d)
  cat("\nGRUPO:", grupo, "\n")
  subconjuntos <- list(
    descriptiva = conocido,
    regresion = completo,
    excluidos_con_outcome = !completo & conocido
  )
  print(do.call(rbind, lapply(names(subconjuntos), function(nombre) {
    y <- d$mortalidad_30d[subconjuntos[[nombre]]]
    data.frame(poblacion = nombre, n = length(y), muertes = sum(y),
               mortalidad_pct = round(100 * mean(y), 4))
  })))
  cat("N total:", nrow(d), "\nAusentes por variable (se solapan):\n")
  print(colSums(is.na(d[variables_regresion])))
}

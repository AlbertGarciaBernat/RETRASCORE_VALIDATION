
stepwise_model <-glm(formula = mortalidad_30d ~ genero_masculino + edad_categoria + 
      precoag + iot_prehospitalaria + mecanismo_alto_riesgo + pupilas + 
      gcs_menor_igual_8 + mais_cabeza + mais_torax + mais_ext_superior + 
      mais_externo + fallo_hemodinamico + fallo_respiratorio + 
      coagulopatia_24h + ventilacion_mecanica + hemorragia_masiva, 
    family = binomial(link = "logit"), data = derivation, na.action = na.fail)


stepwise_model.2<-glm(formula = mortalidad_30d ~  edad_categoria + mais_torax +
                        precoag + iot_prehospitalaria + mecanismo_alto_riesgo + pupilas + 
                        gcs_menor_igual_8 + mais_cabeza  + mais_ext_superior + 
                        mais_externo + fallo_hemodinamico + fallo_respiratorio + 
                        coagulopatia_24h + ventilacion_mecanica + hemorragia_masiva, 
                      family = binomial(link = "logit"), data = derivation, na.action = na.fail)

stepwise_model.2.sex<-glm(formula = mortalidad_30d ~ genero_masculino + edad_categoria + mais_torax +
                        precoag + iot_prehospitalaria + mecanismo_alto_riesgo + pupilas + 
                        gcs_menor_igual_8 + mais_cabeza  + mais_ext_superior + 
                        mais_externo + fallo_hemodinamico + fallo_respiratorio + 
                        coagulopatia_24h + ventilacion_mecanica + hemorragia_masiva, 

                                              family = binomial(link = "logit"), data = derivation, na.action = na.fail)
anova(stepwise_model.2, stepwise_model.2.sex,  
      test = "LRT")


summary(stepwise_model.3<-glm(formula = mortalidad_30d ~ genero_masculino + edad_categoria + 
                        precoag + iot_prehospitalaria + mecanismo_alto_riesgo + pupilas + 
                        gcs_menor_igual_8 + mais_cabeza  + mais_ext_superior + mais_torax*mecanismo_alto_riesgo+
                        mais_externo + fallo_hemodinamico + fallo_respiratorio + 
                        coagulopatia_24h + ventilacion_mecanica + hemorragia_masiva, 
                      family = binomial(link = "logit"), data = derivation, na.action = na.fail)


stepwise_model.4<-glm(formula = mortalidad_30d ~ genero_masculino + edad_categoria + 
                        precoag + iot_prehospitalaria + mecanismo_alto_riesgo + pupilas + 
                        gcs_menor_igual_8 + mais_cabeza  + mais_ext_superior + mais_torax+mecanismo_alto_riesgo+
                        mais_externo + fallo_hemodinamico + fallo_respiratorio + 
                        coagulopatia_24h + ventilacion_mecanica + hemorragia_masiva, 
                      family = binomial(link = "logit"), data = derivation, na.action = na.fail)

summary(stepwise_model.3)
anova(stepwise_model.2, stepwise_model.3,  
      test = "LRT")

library(pROC)
prediction <- predict(stepwise_model.2, derivation, type = "response")
prediction2 <- predict(stepwise_model, derivation, type = "response")

roc_object <- roc(derivation$mortalidad_30d, prediction)
roc_object2 <- roc(derivation$mortalidad_30d, prediction2)
roc_object
roc_object2

pROC::ci.auc(roc_object, method = "delong")
pROC::ci.auc(roc_object2, method = "delong")


prediction <- predict(stepwise_model.2, validation_all, type = "response")
prediction2 <- predict(stepwise_model, validation_all, type = "response")

roc_object <- roc(validation_all$mortalidad_30d, prediction)
roc_object2 <- roc(validation_all$mortalidad_30d, prediction2)
roc_object

pROC::ci.auc(roc_object, method = "delong")
pROC::ci.auc(roc_object2, method = "delong")

derivation[1,]
predict(stepwise_model.2, head(derivation), type = "response")

        
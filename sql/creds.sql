SELECT
    cona.system_id,
    hhmc.manufacturer,
    hhmc.modality,
    hhmc.user_enc,
    hhmc.password_enc
FROM
    config.acquisition cona
    JOIN hhm_credentials hhmc ON hhmc.id = cona.credentials_group :: INTEGER
WHERE
    hhmc.manufacturer = $1
    AND hhmc.modality = $2;
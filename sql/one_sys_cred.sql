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
    cona.system_id = $1
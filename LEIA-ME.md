# Loja Hugol — como publicar e usar o botão Proprietário

1. Escolha uma senha de 4 a 8 números e gere o hash (troque 1234 pela sua):
   node -e "console.log(require('crypto').createHash('sha256').update('1234').digest('hex'))"
2. Netlify > Project configuration > Environment variables > Add a variable
   Key: PUBLISH_PIN_HASH   Value: o hash do passo 1
3. Deploys > Trigger deploy > Deploy site (a variável só vale depois de um novo deploy).
4. No site, toque em "Proprietário" no rodapé e digite a senha (não o hash).

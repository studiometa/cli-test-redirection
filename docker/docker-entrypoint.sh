#!/bin/sh

if [[ $DEBUG == "true" ]]
then
    echo "Configuring vhost..."
fi

# Enable modules: rewrite, ssl
# sed -i "/LoadModule rewrite_module/s/^#//g" /usr/local/apache2/conf/httpd.conf
sed -i \
    -e 's/^#\(LoadModule .*mod_rewrite.so\)/\1/' \
    -e 's/^#\(Include .*httpd-ssl.conf\)/\1/' \
    -e 's/^#\(LoadModule .*mod_ssl.so\)/\1/' \
    -e 's/^#\(LoadModule .*mod_socache_shmcb.so\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# Include additional config
echo "IncludeOptional conf.d/*.conf" >> /usr/local/apache2/conf/httpd.conf

# Create additional config folder
mkdir -p /usr/local/apache2/conf.d

# Add domains to /etc/hosts
echo "127.0.0.1 ${DOMAINS}" >> /etc/hosts

# Create log folder
mkdir -p /var/log/apache2

CONFIG="<VirtualHost *:80>
    ServerName localhost
    ServerAlias ${DOMAINS}

    DocumentRoot /app

    <Directory /app>
        Options -Indexes +ExecCGI
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  /var/log/apache2/error.log
    CustomLog  /var/log/apache2/access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName localhost
    ServerAlias ${DOMAINS}

    DocumentRoot /app

    SSLEngine On
    SSLCertificateFile /usr/local/apache2/conf/server.crt
    SSLCertificateKeyFile /usr/local/apache2/conf/server.key

    <Directory /app>
        Options -Indexes +ExecCGI
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  /var/log/apache2/error.log
    CustomLog  /var/log/apache2/access.log combined
</VirtualHost>"

echo "$CONFIG" > /usr/local/apache2/conf.d/vhost.conf

# Create SSL certificates
mkcert -cert-file /usr/local/apache2/conf/server.crt -key-file /usr/local/apache2/conf/server.key localhost $DOMAINS &> /dev/null

if [[ $DEBUG == "true" ]]
then
    echo "Starting Apache..."
fi
httpd -k start -E /tmp/null

if [[ $DEBUG == "true" ]]
then
    echo "Testing domains..."
    for DOMAIN in $(echo $DOMAINS)
    do
        echo "Testing ping for $DOMAIN..."
        ping -c 1 $DOMAIN
        echo ""
        echo "Testing http://$DOMAIN..."
        curl -sIL http://$DOMAIN
        echo ""
        echo "Testing https://$DOMAIN..."
        curl -sIL https://$DOMAIN
        echo ""
    done
fi

test-redirection "$@"

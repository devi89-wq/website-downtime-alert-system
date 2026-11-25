Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/jammy64"

  # Web Server VM
  config.vm.define "webserver" do |web|
    web.vm.hostname = "webserver"
    web.vm.network "private_network", ip: "192.168.56.10"

    web.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
  end

  # Monitoring VM
  config.vm.define "monitor" do |monitor|
    monitor.vm.hostname = "monitor"
    monitor.vm.network "private_network", ip: "192.168.56.11"

    monitor.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
  end

end

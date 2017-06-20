/**
 * Wrap all functions specific to 'www/checkConfig.html'.
 *
 * @author Lucio Romerio (lucio.romerio@epfl.ch)
 */

// Single conode information
var config;
var conodeEntry;

/**
 * Display - as buttons - all conodes to which the device is registered.
 */
function rsDisplayConodes() {

    // Retrieve all keyPairs
    var sql = "select C.address from conodes C";

    var html = 'Conodes<hr>';

    dbAction(sql, [], function(res) {

        // Populate conodes list
        for (var i = 0; i < res.rows.length; ++i) {
            var addr  = res.rows.item(i).address;
            html += '<button class="list" onclick="sshGetConfig(this.innerHTML);">' + addr + '</button>';
        }

        // Update GUI
        document.getElementById("ssh_conodes_list").innerHTML = html;
    });
}

/**
 * Send a ConfigUpdate message to the given conode and update the GUI.
 *
 * @param address
 */
function sshGetConfig(address) {

    var sql = "select * from conodes C where C.address = ?";

    dbAction(sql, [address], function(res) {

        if (res.rows.length === 1) {

            conodeEntry = res.rows.item(0);

            var id = hex2buf(conodeEntry.serverId);

            // Create ConfigUpdate
            const cu = CothorityProtobuf.createConfigUpdate(id);

            configUpdate(address, cu, function(e) {

                    document.getElementById("ssh_propose").innerHTML = "<span style = 'color: red;'>ERROR: </span>"
                        + e.data;
                    document.getElementById("ssh_conodes_list").style.display = 'none';
                    document.getElementById("ssh_propose").style.display = 'block';

                }, function (response) {

                    // Decode message
                    config = CothorityProtobuf.decodeConfigUpdateReply(response).config;

                    document.getElementById("ssh_conodes_list").style.display = 'none';
                    document.getElementById("ssh_propose").style.display = 'block';
                }
            );
        } else {
            alert("Database corrupted: duplicate conode.");
        }
    });
}

/**
 * Make a proposition to the previously selected conode.
 */
function sshPropose() {

    // Get key name
    var sshName = document.getElementById("sshName").value;

    if (sshName === '') {
        alert('Id field cannot be empty!');
        handler('');
    } else if (sshName in config.device) {
        alert('Key name not available');
        handler('');
    } else {

        // Generate keys pair
        var keyPair = cryptoJS.keyPair();
        var hexKeyPair = buf2hex(keyPair);

        // Add new entry to database
        var sql_1 = "insert into ssh(serverAddr, sshName, sshKeyPair) values(?,?,?)";

        dbAction(sql_1, [conodeEntry.address, sshName, hexKeyPair], function() {

            // Add new public key to config and create ProposeSend
            config.data[sshName] = hexKeyPair;
            const ps = CothorityProtobuf.createProposeSend(hex2buf(conodeEntry.serverId), config);

            proposeSend(conodeEntry.address, ps, function(e) {

                    document.getElementById("ssh_verify").innerHTML = "<span style = 'color: red;'>ERROR: </span>"
                        + e.data;
                    document.getElementById("ssh_propose").style.display = 'none';
                    document.getElementById("ssh_verify").style.display = 'block';

                }, function () {

                    // Vote your proposition
                    var pv = createProposeVote(config, conodeEntry);
                    proposeVote(conodeEntry.address, pv, function(e) {

                            document.getElementById("ssh_verify").innerHTML = "<span style = 'color: red;'>ERROR: </span>"
                                + e.data;
                            document.getElementById("ssh_propose").style.display = 'none';
                            document.getElementById("ssh_verify").style.display = 'block';

                        }, function () {
                            // Update GUI
                            document.getElementById("threshold").innerHTML = config.threshold;
                            document.getElementById("ssh_propose").style.display = 'none';
                            document.getElementById("ssh_verify").style.display = 'block';
                        }
                    );

                }
            );
        });
    }
}
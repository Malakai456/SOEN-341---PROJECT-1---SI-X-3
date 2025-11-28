<?php

require_once('connection.php');





$query = "SELECT user_id, username, first_name  FROM users";
$result = mysqli_query($con, $query);






?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users</title>
    <link rel="stylesheet" href="css/customer.css"> 
</head>
<body>
    
<div class="container">
    <div class="row mt-5">
        <div class="col">
            <div class="card mt-5">
                <div class="card-header">
                    <h2 class="display-6 text-center">Users</h2>
                </div>
                <div class="card-body">
                    <table class="table table-bordered text-center">
                        <tr class="bg-dark text-white">
                            
                        <thead>
                          <tr>
                            <th> user_id </th>
                             <th>username</th>
                             <th>first_name</th>
                             <th>Delete User</th>
                          </tr>
                        </thead>
                        <?php
                        while ($row = mysqli_fetch_assoc($result)) {
                        ?>
                        <tr>
                            
                            <td><?php echo $row['user_id']; ?></td>
                            <td><?php echo $row['username']; ?> </td>
                            <td><?php echo $row['first_name']; ?></td>
                        
                            <!-- <td> <a href = "#" class = "btn btn-primary"> Edit</a></td> -->
                            <td> <a href="users.php?ID=<?php echo ($row['user_id']); ?>" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this user?');">Delete</a> </td>
                             
                            
                        </tr>
                        <?php
                        }
                        ?>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
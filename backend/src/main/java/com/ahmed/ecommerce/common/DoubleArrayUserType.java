package com.ahmed.ecommerce.common;

import java.io.Serializable;
import java.sql.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Arrays;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

public class DoubleArrayUserType implements UserType<double[]> {

    @Override
    public int getSqlType() {
        return Types.ARRAY;
    }

    @Override
    public Class<double[]> returnedClass() {
        return double[].class;
    }

    @Override
    public boolean equals(double[] x, double[] y) {
        return Arrays.equals(x, y);
    }

    @Override
    public int hashCode(double[] x) {
        return Arrays.hashCode(x);
    }

    @Override
    public double[] nullSafeGet(
            ResultSet rs, int position, SharedSessionContractImplementor session, Object owner)
            throws SQLException {
        Array arr = rs.getArray(position);
        if (arr == null) {
            return null;
        }
        Double[] boxed = (Double[]) arr.getArray();
        double[] result = new double[boxed.length];
        for (int i = 0; i < boxed.length; i++) {
            result[i] = boxed[i] == null ? 0.0 : boxed[i];
        }
        arr.free();
        return result;
    }

    @Override
    public void nullSafeSet(
            PreparedStatement st,
            double[] value,
            int index,
            SharedSessionContractImplementor session)
            throws SQLException {
        if (value == null) {
            st.setNull(index, Types.ARRAY, "float8");
        } else {
            Connection con =
                    session.getJdbcCoordinator().getLogicalConnection().getPhysicalConnection();
            Double[] boxed = Arrays.stream(value).boxed().toArray(Double[]::new);
            Array arr = con.createArrayOf("float8", boxed);
            st.setArray(index, arr);
        }
    }

    @Override
    public double[] deepCopy(double[] value) {
        return value == null ? null : value.clone();
    }

    @Override
    public boolean isMutable() {
        return true;
    }

    @Override
    public Serializable disassemble(double[] value) {
        return (Serializable) deepCopy(value);
    }

    @Override
    public double[] assemble(Serializable cached, Object owner) {
        return deepCopy((double[]) cached);
    }

    @Override
    public double[] replace(double[] original, double[] target, Object owner) {
        return deepCopy(original);
    }
}
